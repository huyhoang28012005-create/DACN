import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    room_id?: number;
    equipment_id?: number;
    start_time: string | Date;
    end_time: string | Date;
    description: string;
    created_by: number;
  }) {
    if (!data.room_id && !data.equipment_id) {
      throw new BadRequestException('Phải chọn phòng hoặc thiết bị để bảo trì');
    }

    const start = new Date(data.start_time);
    const end = new Date(data.end_time);

    if (start >= end) {
      throw new BadRequestException(
        'Thời gian bắt đầu phải trước thời gian kết thúc',
      );
    }

    const overlappingBookings = await this.prisma.booking.findFirst({
      where: {
        OR: [
          ...(data.room_id ? [{ room_id: data.room_id }] : []),
          ...(data.equipment_id ? [{ equipment_id: data.equipment_id }] : []),
        ],
        status: { in: ['PENDING', 'APPROVED', 'IN_USE'] },
        start_time: { lt: end },
        end_time: { gt: start },
        is_deleted: false,
      },
    });

    if (overlappingBookings) {
      throw new ConflictException(
        'Không thể xếp lịch bảo trì vì đang có đơn đặt trong khoảng thời gian này. Vui lòng xử lý các đơn đặt trước.',
      );
    }

    return this.prisma.maintenanceSchedule.create({
      data: {
        room_id: data.room_id,
        equipment_id: data.equipment_id,
        start_time: start,
        end_time: end,
        description: data.description,
        created_by: data.created_by,
      },
      include: {
        room: true,
        equipment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.maintenanceSchedule.findMany({
      include: {
        room: true,
        equipment: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { start_time: 'desc' },
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: {
        room: true,
        equipment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!schedule) throw new NotFoundException('Lịch bảo trì không tồn tại');
    return schedule;
  }

  async remove(id: number) {
    return this.prisma.maintenanceSchedule.delete({
      where: { id },
    });
  }

  async update(
    id: number,
    data: {
      room_id?: number;
      equipment_id?: number;
      start_time?: string | Date;
      end_time?: string | Date;
      description?: string;
    },
  ) {
    const schedule = await this.prisma.maintenanceSchedule.findUnique({
      where: { id },
    });
    if (!schedule) throw new NotFoundException('Lịch bảo trì không tồn tại');

    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      if (start >= end) {
        throw new BadRequestException(
          'Thời gian bắt đầu phải trước thời gian kết thúc',
        );
      }
    }

    const finalStart = data.start_time ? new Date(data.start_time) : schedule.start_time;
    const finalEnd = data.end_time ? new Date(data.end_time) : schedule.end_time;
    const finalRoomId = data.room_id !== undefined ? data.room_id : schedule.room_id;
    const finalEquipmentId = data.equipment_id !== undefined ? data.equipment_id : schedule.equipment_id;

    const overlappingBookings = await this.prisma.booking.findFirst({
      where: {
        OR: [
          ...(finalRoomId ? [{ room_id: finalRoomId }] : []),
          ...(finalEquipmentId ? [{ equipment_id: finalEquipmentId }] : []),
        ],
        status: { in: ['PENDING', 'APPROVED', 'IN_USE'] },
        start_time: { lt: finalEnd },
        end_time: { gt: finalStart },
        is_deleted: false,
      },
    });

    if (overlappingBookings) {
      throw new ConflictException(
        'Không thể cập nhật lịch bảo trì vì đang có đơn đặt trong khoảng thời gian này. Vui lòng xử lý các đơn đặt trước.',
      );
    }

    return this.prisma.maintenanceSchedule.update({
      where: { id },
      data: {
        room_id: data.room_id ?? schedule.room_id,
        equipment_id: data.equipment_id ?? schedule.equipment_id,
        start_time: data.start_time
          ? new Date(data.start_time)
          : schedule.start_time,
        end_time: data.end_time ? new Date(data.end_time) : schedule.end_time,
        description: data.description ?? schedule.description,
      },
      include: {
        room: true,
        equipment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
