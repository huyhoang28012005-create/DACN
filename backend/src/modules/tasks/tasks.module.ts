import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, SettingsModule, BookingsModule, NotificationsModule],
  providers: [CronjobsService],
})
export class TasksModule {}
