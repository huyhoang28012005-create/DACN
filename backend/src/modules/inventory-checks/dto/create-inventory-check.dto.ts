import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateInventoryCheckDto {
  @IsNumber()
  chemical_id: number;

  @IsNumber()
  actual_qty: number;

  @IsString()
  @IsOptional()
  note?: string;
}
