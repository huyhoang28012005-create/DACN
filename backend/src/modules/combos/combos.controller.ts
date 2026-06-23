import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CombosService } from './combos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  create(@Body() data: any) {
    return this.combosService.createCombo(data);
  }

  @Get()
  findAll() {
    return this.combosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; description?: string; image_url?: string },
  ) {
    return this.combosService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.remove(id);
  }

  @Post(':id/book')
  bookCombo(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @CurrentUser() user: UserPayload,
  ) {
    // We pass the full user payload because BookingsService needs it to check roles/trust score
    return this.combosService.bookCombo(id, data, user);
  }
}
