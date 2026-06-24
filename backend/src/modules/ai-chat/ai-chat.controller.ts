import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';

import { Booking, Equipment } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';

export interface AiChatContext {
  bookings?: Booking[];
  equipment?: Equipment[];
}

export class AiChatRequestDto {
  message: string;
  context: AiChatContext;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post()
  async chat(@Body() body: AiChatRequestDto, @CurrentUser() user: UserPayload) {
    return this.aiChatService.chat(body.message, user.role, body.context);
  }
}
