import mongoose from 'mongoose';
import { redis } from '../config/connections.js';
import { storageProvider } from './storage.js';
import { emailProvider } from './email.js';
import { searchProvider } from './search.js';
export async function providerHealth() { const [storage, email, search] = await Promise.all([storageProvider.checkHealth?.().catch(() => false) ?? Promise.resolve(true), emailProvider.checkHealth().catch(() => false), searchProvider.checkHealth().catch(() => false)]); return { database: mongoose.connection.readyState === 1, redis: (redis as any).status === 'ready', storageProvider: Boolean(storage), emailProvider: Boolean(email), searchProvider: Boolean(search) }; }
