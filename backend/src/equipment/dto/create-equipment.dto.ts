import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EquipmentStatus } from '@prisma/client';

export class CreateEquipmentDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  serial_number: string;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @IsInt()
  room_id: number;

  @IsOptional()
  @IsDateString()
  last_maintenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @IsOptional()
  @IsDateString()
  purchase_date?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsInt()
  maintenance_interval_months?: number;
}
