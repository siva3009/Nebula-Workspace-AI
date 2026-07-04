import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiProvider, ChatProviderResponse } from './base.provider';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  readonly name = 'gemini';

  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('gemini.apiKey') || '';
    this.defaultModel = this.configService.get<string>('gemini.model') || 'gemini-1.5-flash';
  }

  async chat(prompt: string, model?: string): Promise<ChatProviderResponse> {
    const activeModel = model && model.startsWith('gemini') ? model : this.defaultModel;

    if (!this.apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured.');
      throw new Error('Gemini API key is missing. Please set GEMINI_API_KEY in your env configuration.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${this.apiKey}`;
    
    this.logger.debug(`Sending chat request to Gemini: model=${activeModel}, prompt_length=${prompt.length}`);

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResult) {
        throw new Error('Gemini API returned an empty response candidate.');
      }

      const usage = data.usageMetadata;

      return {
        response: textResult,
        model: activeModel,
        createdAt: new Date().toISOString(),
        usage: usage
          ? {
              promptTokens: usage.promptTokenCount,
              completionTokens: usage.candidatesTokenCount,
              totalTokens: usage.totalTokenCount,
            }
          : undefined,
      };
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      const axiosMsg = data?.error?.message || error.message;
      this.logger.error(`Gemini API HTTP Status: ${status}`);
      this.logger.error(`Gemini API Response Body: ${JSON.stringify(data)}`);
      this.logger.error(`Gemini API call failed: ${axiosMsg}`);
      // Throw original error to preserve status for ProviderManager
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }
    try {
      // Perform a minimal, token-efficient connectivity test
      const testModel = this.defaultModel;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${this.apiKey}`;
      await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                {
                  text: 'ping',
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 1,
          },
        },
        { timeout: 5000 },
      );
      return true;
    } catch (error) {
      this.logger.warn(`Gemini health check failed: ${(error as Error).message}`);
      return false;
    }
  }
}
