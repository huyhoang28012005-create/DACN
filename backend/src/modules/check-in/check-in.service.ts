import { UserPayload } from '../auth/interfaces/user-payload.interface';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { checkOwnership } from '../../common/utils/ownership.util';

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCheckInDto: CreateCheckInDto, userId: number) {
    const { check_in, ...rest } = createCheckInDto;
    return this.prisma.checkInRecord.create({
      data: {
        ...rest,
        user_id: userId,
        ...(check_in && { check_in: new Date(check_in) }),
      },
    });
  }

  async findAll() {
    return this.prisma.checkInRecord.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        booking: { select: { id: true, purpose: true } },
      },
      orderBy: { check_in: 'desc' },
    });
  }

  async getActiveRecords() {
    return this.prisma.checkInRecord.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        booking: { select: { id: true, purpose: true } },
      },
      orderBy: { check_in: 'desc' },
    });
  }

  async getUserHistory(userId: number) {
    return this.prisma.checkInRecord.findMany({
      where: { user_id: userId },
      include: {
        equipment: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        booking: { select: { id: true, purpose: true } },
      },
      orderBy: { check_in: 'desc' },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.checkInRecord.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        booking: { select: { id: true, purpose: true } },
      },
    });

    if (!record) {
      throw new NotFoundException(
        `Bản ghi Check-in với ID ${id} không tồn tại`,
      );
    }

    return record;
  }

  async findOneSecure(id: number, currentUser: UserPayload) {
    const record = await this.findOne(id);
    checkOwnership(record.user_id, currentUser);
    return record;
  }

  async update(
    id: number,
    updateCheckInDto: UpdateCheckInDto,
    currentUser: UserPayload,
  ) {
    await this.findOneSecure(id, currentUser);

    const { check_in, check_out, ...rest } = updateCheckInDto;

    return this.prisma.checkInRecord.update({
      where: { id },
      data: {
        ...rest,
        ...(check_in && { check_in: new Date(check_in) }),
        ...(check_out && { check_out: new Date(check_out) }),
      },
    });
  }

  async checkOut(id: number, currentUser: UserPayload) {
    await this.findOneSecure(id, currentUser);
    return this.prisma.checkInRecord.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        check_out: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.checkInRecord.delete({
      where: { id },
    });
  }

  async scanQR(qrData: string, userId: number) {
    let roomId: number | null = null;
    let equipmentId: number | null = null;

    // Phân tích mã QR
    try {
      const parsed = JSON.parse(qrData) as {
        roomId?: number | string;
        equipmentId?: number | string;
      };
      if (parsed.roomId) {
        roomId =
          typeof parsed.roomId === 'number'
            ? parsed.roomId
            : parseInt(parsed.roomId, 10);
      }
      if (parsed.equipmentId) {
        equipmentId =
          typeof parsed.equipmentId === 'number'
            ? parsed.equipmentId
            : parseInt(parsed.equipmentId, 10);
      }
    } catch {
      if (qrData.includes('roomId=')) {
        const match = qrData.match(/roomId=(\d+)/);
        if (match) roomId = parseInt(match[1], 10);
      }
      if (qrData.includes('equipmentId=')) {
        const match = qrData.match(/equipmentId=(\d+)/);
        if (match) equipmentId = parseInt(match[1], 10);
      }
      if (!roomId && !equipmentId) {
        if (qrData.startsWith('EQ_')) {
          equipmentId = parseInt(qrData.replace('EQ_', ''), 10);
        } else if (qrData.startsWith('ROOM_')) {
          roomId = parseInt(qrData.replace('ROOM_', ''), 10);
        }
      }
    }

    if (!roomId && !equipmentId) {
      throw new BadRequestException('Mã QR không đúng định dạng của hệ thống');
    }

    const now = new Date();
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);

    // Tìm đơn đặt lịch đang hoạt động trong khung giờ hiện tại
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        user_id: userId,
        status: { in: ['APPROVED', 'IN_USE'] },
        start_time: { lte: fifteenMinsFromNow },
        end_time: { gte: now },
        ...(roomId && { room_id: roomId }),
        ...(equipmentId && { equipment_id: equipmentId }),
        is_deleted: false,
      },
      include: {
        check_in_records: true,
      },
    });

    if (!activeBooking) {
      throw new ConflictException(
        'Bạn không có lịch đặt chỗ được phê duyệt nào đang diễn ra tại phòng/thiết bị này lúc này.',
      );
    }

    // Nếu đơn đang APPROVED -> Thực hiện Check-in
    if (activeBooking.status === 'APPROVED') {
      const record = await this.prisma.checkInRecord.create({
        data: {
          booking_id: activeBooking.id,
          user_id: userId,
          room_id: activeBooking.room_id,
          equipment_id: activeBooking.equipment_id,
          status: 'ACTIVE',
          check_in: now,
        },
      });

      await this.prisma.booking.update({
        where: { id: activeBooking.id },
        data: { status: 'IN_USE', row_version: { increment: 1 } },
      });

      if (activeBooking.equipment_id) {
        await this.prisma.equipment.update({
          where: { id: activeBooking.equipment_id },
          data: { status: 'IN_USE' },
        });
      }

      return {
        message: 'Check-in thành công',
        status: 'IN_USE',
        record,
      };
    }

    // Nếu đơn đang IN_USE -> Thực hiện Check-out
    if (activeBooking.status === 'IN_USE') {
      const activeRecord = activeBooking.check_in_records.find(
        (r) => r.status === 'ACTIVE',
      );

      let record;
      if (activeRecord) {
        record = await this.prisma.checkInRecord.update({
          where: { id: activeRecord.id },
          data: {
            status: 'COMPLETED',
            check_out: now,
          },
        });
      } else {
        record = await this.prisma.checkInRecord.create({
          data: {
            booking_id: activeBooking.id,
            user_id: userId,
            room_id: activeBooking.room_id,
            equipment_id: activeBooking.equipment_id,
            status: 'COMPLETED',
            check_in: activeBooking.start_time,
            check_out: now,
          },
        });
      }

      await this.prisma.booking.update({
        where: { id: activeBooking.id },
        data: { status: 'COMPLETED', row_version: { increment: 1 } },
      });

      if (activeBooking.equipment_id) {
        await this.prisma.equipment.updateMany({
          where: { id: activeBooking.equipment_id, status: 'IN_USE' },
          data: { status: 'AVAILABLE' },
        });
      }

      return {
        message: 'Check-out thành công',
        status: 'COMPLETED',
        record,
      };
    }

    throw new BadRequestException(
      'Trạng thái đơn đặt chỗ không hợp lệ để check-in/out',
    );
  }
}
