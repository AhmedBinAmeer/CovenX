import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/covenx'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32).default('development-secret-change-me-please-32'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(30),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  STORAGE_PROVIDER: z.enum(['mock', 's3']).default('mock'),
  STORAGE_URL_EXPIRY_SECONDS: z.coerce.number().int().positive().max(86400).default(900),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_BUCKET: z.string().default(''),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  EMAIL_PROVIDER: z.enum(['mock', 'smtp']).default('mock'),
  AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
  AI_MODEL: z.string().default('gpt-5-mini'),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().max(32000).default(6000),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  WORKER_ENABLED: z.coerce.boolean().default(true),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(2000),
  WORKER_SCHEDULE_INTERVAL_MS: z.coerce.number().int().positive().default(900000),
  INTEGRATION_ENCRYPTION_KEY: z.string().optional(),
  VECTOR_SEARCH_PROVIDER: z.enum(['local', 'atlas']).default('local'),
  VECTOR_SEARCH_INDEX: z.string().default('covenx_document_chunks_vector')
});

export const config = schema.parse(process.env);
