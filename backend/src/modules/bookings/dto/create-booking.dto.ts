import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '@prisma/client';

export class ChemicalUsageDto {
  @IsInt()
  chemical_id: number;

  @IsInt() // Or IsNumber if float is allowed
  @IsPositive()
  quantity: number;
}

export class CreateBookingDto {
  @IsInt()
  room_id: number;

  @IsOptional()
  @IsInt()
  equipment_id?: number;

  @IsOptional()
  @IsInt()
  course_id?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChemicalUsageDto)
  chemical_usages?: ChemicalUsageDto[];

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;
}
