import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('gemini.apiKey') || '';
    this.defaultModel = this.configService.get<string>('gemini.embeddingModel') || 'text-embedding-004';
  }

  async getEmbedding(text: string, model?: string): Promise<number[]> {
    const targetModel = model ?? this.defaultModel;
    
    if (!this.apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured for embeddings.');
      throw new Error('Gemini API key is missing. Cannot generate document embeddings.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:embedContent?key=${this.apiKey}`;

    try {
      const response = await axios.post(
        url,
        {
          content: {
            parts: [
              {
                text: text,
              },
            ],
          },
          outputDimensionality: 768,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const embeddingValues = response.data?.embedding?.values;

      if (!embeddingValues || !Array.isArray(embeddingValues)) {
        throw new Error('Gemini API returned an invalid embedding response structure.');
      }

      this.logger.debug(`Successfully generated embedding via Gemini: model=${targetModel}, dimensions=${embeddingValues.length}`);
      return embeddingValues;
    } catch (error: any) {
      const axiosMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to get embedding from Gemini: ${axiosMsg}`);
      throw new Error(`Gemini Embedding Error: ${axiosMsg}`);
    }
  }

  async getEmbeddingsBatch(texts: string[], model?: string): Promise<number[][]> {
    const targetModel = model ?? this.defaultModel;
    
    if (!this.apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured for embeddings.');
      throw new Error('Gemini API key is missing. Cannot generate document embeddings.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:batchEmbedContents?key=${this.apiKey}`;

    try {
      const response = await axios.post(
        url,
        {
          requests: texts.map((text) => ({
            model: `models/${targetModel}`,
            content: {
              parts: [
                {
                  text: text,
                },
              ],
            },
            outputDimensionality: 768,
          })),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const embeddings = response.data?.embeddings;

      if (!embeddings || !Array.isArray(embeddings)) {
        throw new Error('Gemini API returned an invalid batch embedding response structure.');
      }

      this.logger.debug(`Successfully generated ${embeddings.length} embeddings via Gemini batch API`);
      return embeddings.map((e) => e.values);
    } catch (error: any) {
      const axiosMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to get batch embeddings from Gemini: ${axiosMsg}`);
      throw new Error(`Gemini Batch Embedding Error: ${axiosMsg}`);
    }
  }
}
