import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import { config } from './index.js';

export const redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });

export async function connectInfrastructure(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try { await redis.connect(); } catch { /* Redis is recoverable; workers retry at runtime. */ }
}

export async function disconnectInfrastructure(): Promise<void> {
  if ((redis as any).status !== 'end') await redis.quit();
  await mongoose.disconnect();
}

export async function withTransaction<T>(work: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => { result = await work(session); });
    return result;
  } finally {
    await session.endSession();
  }
}
