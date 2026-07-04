import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { AiService } from './ai.service';
import { ChatRequestDto } from './dto';
import type { ChatResponseDto } from './dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/v1/ai/chat
   * Send a message to the AI and receive a response
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.aiService.chat(dto.message, dto.model);
  }

  /**
   * GET /api/v1/ai/health
   * Check AI service connectivity
   */
  @Get('health')
  async health(): Promise<{ gemini: boolean }> {
    return this.aiService.checkHealth();
  }
}
