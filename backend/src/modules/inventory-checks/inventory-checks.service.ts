import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateInventoryCheckDto } from './dto/create-inventory-check.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryChecksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createInventoryCheckDto: CreateInventoryCheckDto) {
    const { chemical_id, actual_qty, note } = createInventoryCheckDto;

    return this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      const chemical = await prisma.chemical.findUnique({
        where: { id: chemical_id },
      });

      if (!chemical) {
        throw new BadRequestException('Hóa chất không tồn tại');
      }

      const expected_qty = chemical.quantity_stock;
      const discrepancy = actual_qty - expected_qty;

      // Update chemical stock to match actual_qty
      await prisma.chemical.update({
        where: { id: chemical_id },
        data: { quantity_stock: actual_qty },
      });

      // Record inventory check
      return prisma.inventoryCheck.create({
        data: {
          chemical_id,
          user_id: userId,
          expected_qty,
          actual_qty,
          discrepancy,
          note,
        },
      });
    });
  }

  findAll(chemicalId?: number) {
    const where = chemicalId ? { chemical_id: chemicalId } : {};
    return this.prisma.inventoryCheck.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        chemical: true,
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }
}
