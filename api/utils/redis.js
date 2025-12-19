/* global process */
import { createClient } from 'redis';

// Shared Redis key prefixes
export const GALLERY_INDEX_KEY = 'gallery:items';
export const GALLERY_ITEM_PREFIX = 'gallery:item:';
export const GALLERY_HASH_PREFIX = 'gallery:hash:';
export const RATE_LIMIT_PREFIX = 'ratelimit:';

// Lazy-initialized Redis client singleton
let redis = null;

/**
 * Get or create Redis client singleton
 * @returns {Promise<import('redis').RedisClientType>}
 */
export async function getRedis() {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL environment variable is not defined');
    }
    redis = createClient({ url });
    redis.on('error', (err) => console.error('Redis Client Error', err));
    await redis.connect();
  }
  return redis;
}

/**
 * Create a standardized error response
 * @param {string} action - The action that failed (for logging)
 * @param {Error} error - The error object
 * @param {string} message - User-facing error message
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function errorResponse(action, error, message, status = 500) {
  console.error(`Gallery ${action} error:`, error);
  return Response.json({ error: message }, { status });
}

/**
 * Shared runtime config for Vercel
 */
export const runtimeConfig = {
  runtime: 'nodejs',
};
