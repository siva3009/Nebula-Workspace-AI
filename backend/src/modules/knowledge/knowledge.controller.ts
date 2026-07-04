import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';

import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('files')
  async getFiles() {
    return this.knowledgeService.getFiles();
  }

  @Post('search')
  async search(@Body() body: { query: string; limit?: number }) {
    if (!body || !body.query) {
      throw new BadRequestException('Query parameter is required');
    }
    return this.knowledgeService.searchKnowledge(body.query, body.limit);
  }
}
