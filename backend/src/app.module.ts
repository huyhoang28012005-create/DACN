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
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { ConfigModule } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { SettingsModule } from './settings/settings.module';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { NotificationsModule } from './notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

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
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          { name: 'short', ttl: 60000, limit: 10 },
          { name: 'long', ttl: 3600000, limit: 100 },
        ],
        storage: new ThrottlerStorageRedisService(process.env.REDIS_URL || 'redis://localhost:6379'),
      }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RoomsModule,
    EquipmentModule,
    ChemicalsModule,
    BookingsModule,
    ReportsModule,
    CheckInModule,
    CoursesModule,
    CommentsModule,
    ScheduleModule.forRoot(),
    TasksModule,
    SettingsModule,
    NotificationsModule,
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
