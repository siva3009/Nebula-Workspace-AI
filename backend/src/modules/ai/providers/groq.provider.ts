import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiProvider, ChatProviderResponse } from './base.provider';

@Injectable()
export class GroqProvider implements AiProvider {
  private readonly logger = new Logger(GroqProvider.name);
  readonly name = 'groq';

  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('groq.apiKey') || '';
    this.defaultModel = this.configService.get<string>('groq.model') || 'llama3-8b-8192';
  }

  async chat(prompt: string, model?: string): Promise<ChatProviderResponse> {
    const activeModel = model || this.defaultModel;

    if (!this.apiKey) {
      const errMsg = 'Groq API Key is missing. Cannot proceed with chat request.';
      this.logger.error(errMsg);
      throw new Error(errMsg);
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: activeModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq returned empty completions choices.');
      }

      const usage = response.data.usage;

      return {
        response: content,
        model: activeModel,
        createdAt: new Date().toISOString(),
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens,
              completionTokens: usage.completion_tokens,
              totalTokens: usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Groq API call failed: ${errMsg}`);
      throw new Error(`Groq Error: ${errMsg}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    return !!this.apiKey;
  }
}
