import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import { config } from './index.js';

export const redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
export async function connectInfrastructure(): Promise<void> { let lastError: unknown; for (let attempt = 1; attempt <= 3; attempt += 1) { try { await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }); break; } catch (error) { lastError = error; if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1))); } } if (mongoose.connection.readyState !== 1) throw lastError ?? new Error('MONGODB_UNAVAILABLE'); try { await redis.connect(); } catch { /* Redis is recoverable; readiness reports it separately. */ } }
export async function disconnectInfrastructure(): Promise<void> { if ((redis as any).status !== 'end') await redis.quit(); await mongoose.disconnect(); }
export async function withTransaction<T>(work: (session: mongoose.ClientSession) => Promise<T>): Promise<T> { const session = await mongoose.startSession(); try { let result!: T; await session.withTransaction(async () => { result = await work(session); }); return result; } finally { await session.endSession(); } }
export function infrastructureStatus() { return { database: mongoose.connection.readyState === 1 ? 'ready' : 'not_ready', redis: (redis as any).status === 'ready' ? 'ready' : 'not_ready' }; }
