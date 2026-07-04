import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['APP_PORT'] || '3000', 10),
  name: process.env['APP_NAME'] || 'Nebula Backend',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env['DATABASE_URL'],
  name: process.env['DB_NAME'] || 'nebula',
  user: process.env['DB_USER'] || 'nebula',
  password: process.env['DB_PASSWORD'] || 'nebula-dev',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env['JWT_SECRET'] || 'change-me-in-production',
  expiration: process.env['JWT_EXPIRATION'] || '7d',
}));

export const geminiConfig = registerAs('gemini', () => ({
  apiKey: process.env['GEMINI_API_KEY'] || '',
  model: process.env['GEMINI_MODEL'] || 'gemini-1.5-flash',
  embeddingModel: process.env['GEMINI_EMBEDDING_MODEL'] || 'text-embedding-004',
}));

export const groqConfig = registerAs('groq', () => ({
  apiKey: process.env['GROQ_API_KEY'] || '',
  model: process.env['GROQ_MODEL'] || 'llama3-8b-8192',
}));

export const aiConfig = registerAs('ai', () => ({
  provider: process.env['AI_PROVIDER'] || 'gemini',
}));

export const qdrantConfig = registerAs('qdrant', () => ({
  url: process.env['QDRANT_URL'] || 'http://localhost:6333',
  apiKey: process.env['QDRANT_API_KEY'] || '',
  collectionName: process.env['QDRANT_COLLECTION_NAME'] || 'nebula_knowledge',
  vectorSize: parseInt(process.env['QDRANT_VECTOR_SIZE'] || '768', 10),
}));

export const storageConfig = registerAs('storage', () => ({
  type: process.env['STORAGE_TYPE'] || 'local',
  localPath: process.env['STORAGE_LOCAL_PATH'] || '/tmp/nebula-files',
  maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '52428800', 10),
  maxFileSizeMb: parseInt(process.env['MAX_UPLOAD_SIZE_MB'] || process.env['MAX_FILE_SIZE_MB'] || '25', 10),
  maxUserUploads: parseInt(process.env['MAX_USER_UPLOADS'] || '15', 10),
  maxConcurrentUploads: parseInt(process.env['MAX_CONCURRENT_UPLOADS'] || '2', 10),
}));

export const chunkConfig = registerAs('chunk', () => ({
  size: parseInt(process.env['KNOWLEDGE_CHUNK_SIZE'] || '800', 10),
  overlap: parseInt(process.env['KNOWLEDGE_CHUNK_OVERLAP'] || '150', 10),
}));

export const searchConfig = registerAs('search', () => ({
  topK: parseInt(process.env['KNOWLEDGE_SEARCH_TOP_K'] || '5', 10),
  scoreThreshold: parseFloat(process.env['KNOWLEDGE_SCORE_THRESHOLD'] || '0.7'),
  maxContextChars: parseInt(process.env['KNOWLEDGE_MAX_CONTEXT_CHARS'] || '4000', 10),
}));

export const corsConfig = registerAs('cors', () => ({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
}));
