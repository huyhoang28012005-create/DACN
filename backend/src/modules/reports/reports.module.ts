import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SettingsModule } from '../settings/settings.module';
import { ExcelModule } from '../../common/excel/excel.module';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [SettingsModule, ExcelModule, PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
