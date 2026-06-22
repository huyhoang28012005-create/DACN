import { Controller, Post, Body } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';

import { Booking, Equipment } from '@prisma/client';

export interface AiChatContext {
  bookings?: Booking[];
  equipment?: Equipment[];
}

export class AiChatRequestDto {
  message: string;
  role: string;
  context: AiChatContext;
}

@Controller('chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post()
  async chat(@Body() body: AiChatRequestDto) {
    return this.aiChatService.chat(body.message, body.role, body.context);
  }
}
