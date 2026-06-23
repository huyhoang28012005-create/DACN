import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    const { last_maintenance, ...rest } = createEquipmentDto;
    const equipment = await this.prisma.equipment.create({
      data: {
        ...rest,
        last_maintenance: last_maintenance ? new Date(last_maintenance) : null,
      },
    });
    this.notificationsService.broadcastEquipmentUpdate();
    return equipment;
  }

  async findAll(roomId?: number, startTime?: string, endTime?: string) {
    const where: Prisma.EquipmentWhereInput = { is_deleted: false };
    if (roomId) {
      where.room_id = roomId;
    }

    if (startTime && endTime) {
      const searchStart = new Date(startTime);
      const searchEnd = new Date(endTime);

      if (!isNaN(searchStart.getTime()) && !isNaN(searchEnd.getTime())) {
        const conflictingBookings = await this.prisma.booking.findMany({
          where: {
            status: { in: ['PENDING', 'APPROVED', 'IN_USE'] },
            start_time: { lt: searchEnd },
            end_time: { gt: searchStart },
            equipment_id: { not: null },
          },
          select: { equipment_id: true },
        });

        const busyEquipmentIds = conflictingBookings
          .map((b) => b.equipment_id)
          .filter((id) => id !== null);

        if (busyEquipmentIds.length > 0) {
          where.id = { notIn: busyEquipmentIds };
        }
      }
    }

    return this.prisma.equipment.findMany({
      where,
      take: 1000,
      include: {
        room: true,
        required_badges: true,
      },
    });
  }

  async findOne(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Thiết bị với ID ${id} không tồn tại`);
    }

    return equipment;
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    await this.findOne(id); // Check existence

    const { last_maintenance, ...rest } = updateEquipmentDto;

    // Increment row_version for Optimistic Locking
    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: {
        ...rest,
        ...(last_maintenance !== undefined && {
          last_maintenance: last_maintenance
            ? new Date(last_maintenance)
            : null,
        }),
        row_version: {
          increment: 1,
        },
      },
    });
    this.notificationsService.broadcastEquipmentUpdate();
    return equipment;
  }

  async remove(id: number) {
    await this.findOne(id);

    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: { is_deleted: true },
    });
    this.notificationsService.broadcastEquipmentUpdate();
    return equipment;
  }
}
