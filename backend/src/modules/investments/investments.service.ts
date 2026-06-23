import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.labInvestment.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.labInvestment.findMany({
      include: {
        room: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const investment = await this.prisma.labInvestment.findUnique({
      where: { id },
      include: {
        room: { select: { name: true } },
      },
    });
    if (!investment) {
      throw new NotFoundException(`Đầu tư với ID ${id} không tồn tại`);
    }
    return investment;
  }

  async remove(id: number) {
    return this.prisma.labInvestment.delete({
      where: { id },
    });
  }
}
