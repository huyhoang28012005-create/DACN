import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsNumber()
  @IsOptional()
  assigned_to_id?: number;
}
