import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly url: string;
  private readonly collectionName: string;
  private readonly apiKey: string;
  private readonly vectorSize: number;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('qdrant.url') || 'http://localhost:6333';
    this.collectionName = this.configService.get<string>('qdrant.collectionName') || 'nebula_knowledge';
    this.apiKey = this.configService.get<string>('qdrant.apiKey') || '';
    this.vectorSize = this.configService.get<number>('qdrant.vectorSize') || 768; // default to text-embedding-004 size
  }

  async onModuleInit() {
    await this.ensureCollectionExists();
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }
    return headers;
  }

  async ensureCollectionExists() {
    try {
      await axios.get(`${this.url}/collections/${this.collectionName}`, {
        headers: this.getHeaders(),
      });
      this.logger.log(`Qdrant collection "${this.collectionName}" exists.`);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        this.logger.log(`Qdrant collection "${this.collectionName}" does not exist. Creating...`);
        try {
          await axios.put(
            `${this.url}/collections/${this.collectionName}`,
            {
              vectors: {
                size: this.vectorSize,
                distance: 'Cosine',
              },
            },
            { headers: this.getHeaders() }
          );
          this.logger.log(`Qdrant collection "${this.collectionName}" created successfully with size ${this.vectorSize}.`);
        } catch (createError: any) {
          this.logger.error(`Failed to create Qdrant collection: ${createError.message}`);
        }
      } else {
        this.logger.error(`Error checking Qdrant collection: ${error.message}`);
      }
    }
  }

  async upsertPoints(points: any[]) {
    try {
      await axios.put(
        `${this.url}/collections/${this.collectionName}/points`,
        { points },
        { headers: this.getHeaders() }
      );
      this.logger.log(`Successfully upserted ${points.length} points to Qdrant.`);
    } catch (error: any) {
      this.logger.error(`Failed to upsert points to Qdrant: ${error.message}`);
      throw error;
    }
  }

  async searchSimilar(vector: number[], limit: number, threshold: number): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.url}/collections/${this.collectionName}/points/search`,
        {
          vector,
          limit,
          score_threshold: threshold,
          with_payload: true,
        },
        { headers: this.getHeaders() }
      );
      return response.data.result || [];
    } catch (error: any) {
      this.logger.error(`Failed to search points in Qdrant: ${error.message}`);
      throw error;
    }
  }
}
