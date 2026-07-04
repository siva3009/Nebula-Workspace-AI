import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';

import { ChatService } from './chat.service';
import { CreateConversationDto, CreateMessageDto } from './dto';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '../auth';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@CurrentUser() user: JwtPayload) {
    return this.chatService.getConversations(user.sub);
  }

  @Post('conversations')
  async createConversation(
    @CurrentUser() user: JwtPayload,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user.sub, createConversationDto.title);
  }

  @Get('conversations/:id')
  async getConversation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.chatService.getConversation(id, user.sub);
  }

  @Post('conversations/:id/messages')
  async createMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.createMessage(id, user.sub, createMessageDto.message);
  }
}

