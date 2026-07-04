import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, ChatProviderResponse } from './base.provider';

@Injectable()
export class FutureLocalProvider implements AiProvider {
  private readonly logger = new Logger(FutureLocalProvider.name);
  readonly name = 'local';

  async chat(prompt: string, model?: string): Promise<ChatProviderResponse> {
    this.logger.log('Future local provider called (placeholder).');
    return {
      response: `[Local Provider Placeholder] Local inference is disabled. Prompt received: "${prompt.substring(0, 50)}..."`,
      model: model || 'local-stub',
      createdAt: new Date().toISOString(),
    };
  }

  async checkHealth(): Promise<boolean> {
    return false;
  }
}
