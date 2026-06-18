import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PrismaService } from '../prisma/prisma.service';
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

  async findAll(roomId?: number) {
    const where: any = {};
    if (roomId) {
      where.room_id = roomId;
    }
    return this.prisma.equipment.findMany({
      where,
      take: 1000,
      include: {
        room: true,
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
