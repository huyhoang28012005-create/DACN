import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    // Danh sách các model có hỗ trợ soft delete (cột is_deleted)
    const softDeleteModels = [
      'User',
      'Course',
      'Room',
      'Equipment',
      'Report',
      'Booking',
      'Chemical',
    ];

    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      if (params.model && softDeleteModels.includes(params.model)) {
        if (
          params.action === 'findUnique' ||
          params.action === 'findFirst' ||
          params.action === 'findMany' ||
          params.action === 'count'
        ) {
          if (params.action === 'findUnique') {
            params.action = 'findFirst';
          }
          if (!params.args) params.args = {};
          const args = params.args as { where?: { is_deleted?: boolean } };
          if (!args.where) {
            args.where = {};
          }
          if (args.where.is_deleted === undefined) {
            args.where.is_deleted = false;
          }
        }
      }
      return next(params) as Promise<unknown>;
    });
  }
}
