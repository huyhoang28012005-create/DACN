import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { PenaltyStatus } from '@prisma/client';

export class CreatePenaltyDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  @IsOptional()
  report_id?: number;

  @IsNumber()
  amount: number;

  @IsString()
  reason: string;

  @IsEnum(PenaltyStatus)
  @IsOptional()
  status?: PenaltyStatus;
}
