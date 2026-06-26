import { IsNumber, IsString, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateChemicalTransactionDto {
  @IsNumber()
  chemical_id: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  note?: string;
}
