import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SkillBadgesService } from './skill-badges.service';
import { CreateSkillBadgeDto, AssignBadgeDto } from './dto/skill-badge.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skill-badges')
export class SkillBadgesController {
  constructor(private readonly skillBadgesService: SkillBadgesService) {}

  @Get()
  findAll() {
    return this.skillBadgesService.findAll();
  }

  @Get('my-badges')
  findMyBadges(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.skillBadgesService.findMyBadges(userId);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSkillBadgeDto) {
    return this.skillBadgesService.create(dto);
  }

  @Post('assign')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  assign(@Body() dto: AssignBadgeDto) {
    return this.skillBadgesService.assign(dto);
  }
}
