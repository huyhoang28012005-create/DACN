import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PenaltiesService {
  constructor(private prisma: PrismaService) {}

  create(createPenaltyDto: CreatePenaltyDto) {
    return this.prisma.penalty.create({
      data: createPenaltyDto,
    });
  }

  findAll(userId?: number) {
    const where = userId ? { user_id: userId } : {};
    return this.prisma.penalty.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        report: true,
      },
    });
  }

  async findOne(id: number) {
    const penalty = await this.prisma.penalty.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        report: true,
      },
    });
    if (!penalty) throw new NotFoundException('Phiếu phạt không tồn tại');
    return penalty;
  }

  async update(id: number, updatePenaltyDto: UpdatePenaltyDto) {
    await this.findOne(id);
    return this.prisma.penalty.update({
      where: { id },
      data: updatePenaltyDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.penalty.delete({
      where: { id },
    });
  }
}
