import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  equipment_id?: number;
}

export class CreateCommentDto {
  @IsString()
  content: string;
}
