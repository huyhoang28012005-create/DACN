import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserPayload } from '../auth/interfaces/user-payload.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUnreadNotifications(@Request() req: { user: UserPayload }) {
    const userId = req.user.userId;
    return this.notificationsService.getUnreadNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Request() req: { user: UserPayload },
  ) {
    const userId = req.user.userId;
    return this.notificationsService.markAsRead(Number(id), userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: { user: UserPayload }) {
    const userId = req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }
}
