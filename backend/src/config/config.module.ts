import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  appConfig,
  databaseConfig,
  jwtConfig,
  geminiConfig,
  groqConfig,
  aiConfig,
  qdrantConfig,
  storageConfig,
  chunkConfig,
  searchConfig,
  corsConfig,
} from './configuration';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(databaseConfig),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(geminiConfig),
    ConfigModule.forFeature(groqConfig),
    ConfigModule.forFeature(aiConfig),
    ConfigModule.forFeature(qdrantConfig),
    ConfigModule.forFeature(storageConfig),
    ConfigModule.forFeature(chunkConfig),
    ConfigModule.forFeature(searchConfig),
    ConfigModule.forFeature(corsConfig),
  ],
})
export class AppConfigModule {}
