import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

    this.$use(async (params, next) => {
      if (params.model && softDeleteModels.includes(params.model)) {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          // findUnique yêu cầu trường unique, ta đổi thành findFirst để kẹp thêm điều kiện
          params.action = 'findFirst';
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          if (params.args.where.is_deleted === undefined) {
            params.args.where.is_deleted = false;
          }
        }
        if (params.action === 'findMany' || params.action === 'count') {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          if (params.args.where.is_deleted === undefined) {
            params.args.where.is_deleted = false;
          }
        }
      }
      return next(params);
    });
  }
}
