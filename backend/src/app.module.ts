import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { ChemicalsModule } from './modules/chemicals/chemicals.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { ConfigModule } from '@nestjs/config';
import { CommentsModule } from './modules/comments/comments.module';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './modules/tasks/tasks.module';
import { SettingsModule } from './modules/settings/settings.module';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { SearchModule } from './modules/search/search.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ExcelModule } from './common/excel/excel.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { CombosModule } from './modules/combos/combos.module';
import { CommunityModule } from './modules/community/community.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { WaitlistsModule } from './modules/waitlists/waitlists.module';
import { SkillBadgesModule } from './modules/skill-badges/skill-badges.module';
import { ChemicalLimitsModule } from './modules/chemical-limits/chemical-limits.module';

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
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 3600000, limit: 1000 },
    ]),
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
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    SearchModule,
    AiChatModule,
    UploadsModule,
    ExcelModule,
    InvestmentsModule,
    PublicationsModule,
    MaintenanceModule,
    CombosModule,
    CommunityModule,
    RatingsModule,
    WaitlistsModule,
    SkillBadgesModule,
    ChemicalLimitsModule,
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
