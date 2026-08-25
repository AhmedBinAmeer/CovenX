import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import { config } from './index.js';

export const redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });

export async function connectInfrastructure(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try { await redis.connect(); } catch { /* Redis is recoverable; workers retry at runtime. */ }
}

export async function disconnectInfrastructure(): Promise<void> {
  await mongoose.disconnect();
  if ((redis as any).status !== 'end') await redis.quit();
}
