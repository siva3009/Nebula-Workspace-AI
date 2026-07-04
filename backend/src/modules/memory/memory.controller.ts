import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';

import { MemoryService } from './memory.service';

@Controller('memory')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  // TODO: Implement memory retrieval, search, and management endpoints
}
