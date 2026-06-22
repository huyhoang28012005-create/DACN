import { IsOptional, IsInt } from 'class-validator';

export class CreateWaitlistDto {
  @IsOptional()
  @IsInt()
  equipment_id?: number;

  @IsOptional()
  @IsInt()
  room_id?: number;
}
