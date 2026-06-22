import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateSkillBadgeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  icon_url?: string;
}

export class AssignBadgeDto {
  @IsInt()
  user_id: number;

  @IsInt()
  badge_id: number;
}
