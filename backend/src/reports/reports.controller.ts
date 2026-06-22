import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.reportsService.create(createReportDto, user.userId);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('user/my-reports')
  findMyReports(@CurrentUser() user: UserPayload) {
    return this.reportsService.findMyReports(user.userId);
  }

  @Get('statistics/overview')
  getStatistics() {
    return this.reportsService.getStatistics();
  }

  @Get('operational')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  getOperationalStats() {
    return this.reportsService.getOperationalStats();
  }

  @Get('management')
  @Roles(Role.ADMIN, Role.TECHNICIAN, Role.INSTRUCTOR)
  getManagementStats() {
    return this.reportsService.getManagementStats();
  }

  @Get('strategic')
  @Roles(Role.ADMIN)
  getStrategicStats() {
    return this.reportsService.getStrategicStats();
  }

  @Get('export/excel')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.TECHNICIAN)
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.reportsService.exportToExcel();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reports_export.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Get('export/strategic-excel')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async exportStrategicToExcel(@Res() res: Response) {
    const buffer = await this.reportsService.exportStrategicToExcel();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="strategic_export.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.reportsService.findOneSecure(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }

  @Post('schedule-maintenance/:equipmentId')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  scheduleMaintenance(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.reportsService.scheduleMaintenance(equipmentId, user.userId);
  }
}
