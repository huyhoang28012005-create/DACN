import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsOptional()
  @IsInt()
  equipment_id?: number;

  @IsOptional()
  @IsInt()
  room_id?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
