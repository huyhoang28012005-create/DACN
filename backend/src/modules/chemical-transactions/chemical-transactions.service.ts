import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateChemicalTransactionDto } from './dto/create-chemical-transaction.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChemicalTransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createChemicalTransactionDto: CreateChemicalTransactionDto) {
    const { chemical_id, type, quantity, note } = createChemicalTransactionDto;

    return this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // 1. Fetch chemical to check stock
      const chemical = await prisma.chemical.findUnique({
        where: { id: chemical_id },
      });

      if (!chemical) {
        throw new BadRequestException('Hóa chất không tồn tại');
      }

      // 2. Determine new stock quantity
      let newStock = chemical.quantity_stock;
      if (type === 'RESTOCK') {
        newStock += quantity;
      } else if (type === 'USAGE' || type === 'DISPOSAL') {
        if (chemical.quantity_stock < quantity) {
          throw new BadRequestException('Số lượng trong kho không đủ');
        }
        newStock -= quantity;
      }

      // 3. Update stock
      await prisma.chemical.update({
        where: { id: chemical_id },
        data: { quantity_stock: newStock },
      });

      // 4. Record transaction
      return prisma.chemicalTransaction.create({
        data: {
          chemical_id,
          user_id: userId,
          type,
          quantity,
          note,
        },
      });
    });
  }

  findAll(chemicalId?: number) {
    const where = chemicalId ? { chemical_id: chemicalId } : {};
    return this.prisma.chemicalTransaction.findMany({
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
