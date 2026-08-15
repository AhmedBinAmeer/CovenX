import { createClient, RedisClientType } from 'redis';
import { config } from './env.js';

let redisClient: RedisClientType | null = null;

export const initRedis = async (): Promise<RedisClientType | null> => {
  try {
    redisClient = createClient({ url: config.redisUrl });
    
    redisClient.on('error', (err) => console.error('[Redis Client Error]', err));
    redisClient.on('connect', () => console.log('[Redis] Connected to Redis Cloud'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('[Redis Warning] Redis connection failed, running without cache:', error);
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => redisClient;
