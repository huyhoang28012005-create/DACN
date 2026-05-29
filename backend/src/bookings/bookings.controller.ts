import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
    return this.bookingsService.create(createBookingDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('user/my-bookings')
  findMyBookings(@Request() req: any) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.bookingsService.findOneSecure(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.TECHNICIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Post(':id/cancel')
  cancelBooking(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.bookingsService.cancelBooking(id, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.remove(id);
  }
}
