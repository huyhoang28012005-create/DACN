import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  create(@Body() data: any) {
    return this.publicationsService.create(data);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  findAll() {
    return this.publicationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.publicationsService.findOne(id);
  }

  @Get('by-room/:roomId')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.publicationsService.findByRoom(roomId);
  }

  @Get('by-user/:userId')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.publicationsService.findByUser(userId);
  }

  @Get('my-publications')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  findMyPublications(@CurrentUser() user: UserPayload) {
    return this.publicationsService.findByUser(user.userId);
  }

  @Get('stats/by-room')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  getStatsByRoom() {
    return this.publicationsService.getStatsByRoom();
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.publicationsService.remove(id);
  }
}
