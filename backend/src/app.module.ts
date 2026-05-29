import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ChemicalsModule } from './chemicals/chemicals.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReportsModule } from './reports/reports.module';
import { CheckInModule } from './check-in/check-in.module';
import { CoursesModule } from './courses/courses.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(32).required().messages({
          'string.min': 'Bảo mật 2025: JWT_SECRET phải có ít nhất 32 ký tự.',
          'any.required': 'Lỗi khởi động: Thiếu biến môi trường JWT_SECRET.',
        }),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 60s (1 phút)
        limit: 10,  // Tối đa 10 request
      },
      {
        name: 'long',
        ttl: 3600000, // 3600s (1 giờ)
        limit: 100, // Tối đa 100 request
      },
    ]),
    PrismaModule, UsersModule, AuthModule, RoomsModule, EquipmentModule, ChemicalsModule, BookingsModule, ReportsModule, CheckInModule, CoursesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
