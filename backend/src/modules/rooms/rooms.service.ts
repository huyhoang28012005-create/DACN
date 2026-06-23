import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createRoomDto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: createRoomDto,
    });
    this.notificationsService.broadcastRoomUpdate();
    return room;
  }

  async findAll() {
    return this.prisma.room.findMany({
      where: { is_deleted: false },
      take: 1000,
      include: {
        _count: {
          select: { equipment: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        equipment: true,
      },
    });

    if (!room) {
      throw new NotFoundException(`Phòng Lab với ID ${id} không tồn tại`);
    }

    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    // Check if exists
    await this.findOne(id);

    const room = await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
    this.notificationsService.broadcastRoomUpdate();
    return room;
  }

  async remove(id: number) {
    // Check if exists
    await this.findOne(id);

    const room = await this.prisma.room.update({
      where: { id },
      data: { is_deleted: true },
    });
    this.notificationsService.broadcastRoomUpdate();
    return room;
  }
}
