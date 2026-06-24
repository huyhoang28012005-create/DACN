import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { InventoryChecksService } from './inventory-checks.service';
import { CreateInventoryCheckDto } from './dto/create-inventory-check.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';

@Controller('inventory-checks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryChecksController {
  constructor(private readonly inventoryChecksService: InventoryChecksService) {}

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  create(
    @CurrentUser() user: UserPayload,
    @Body() createInventoryCheckDto: CreateInventoryCheckDto,
  ) {
    return this.inventoryChecksService.create(user.userId, createInventoryCheckDto);
  }

  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  findAll(@Query('chemicalId') chemicalId?: string) {
    return this.inventoryChecksService.findAll(chemicalId ? parseInt(chemicalId) : undefined);
  }
}
