import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ProviderManager } from './provider.manager';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { FutureLocalProvider } from './providers/local.provider';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    ProviderManager,
    GeminiProvider,
    GroqProvider,
    FutureLocalProvider,
  ],
  exports: [
    AiService,
    ProviderManager,
    GeminiProvider,
    GroqProvider,
    FutureLocalProvider,
  ],
})
export class AiModule {}
