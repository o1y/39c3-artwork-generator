import { createHash, randomUUID } from 'crypto';
import {
  getRedis,
  GALLERY_INDEX_KEY,
  GALLERY_ITEM_PREFIX,
  GALLERY_HASH_PREFIX,
  RATE_LIMIT_PREFIX,
  errorResponse,
  runtimeConfig,
} from '../utils/redis.js';

const RATE_LIMIT_WINDOW = 180; // 3 minutes
const RATE_LIMIT_MAX = 5; // max posts per window
const MAX_TEXT_LENGTH = 200;

function generateId() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

/**
 * Generate a hash of the config for duplicate detection
 * @param {Object} config - Artwork configuration
 * @returns {string} 16-character hex hash
 */
function hashConfig(config) {
  const normalized = JSON.stringify({
    theme: config.theme,
    text: config.text,
    colorMode: config.colorMode,
    mode: config.mode,
    numLines: config.numLines,
    minWeight: config.minWeight,
    maxWeight: config.maxWeight,
    widthValue: config.widthValue,
    opszValue: config.opszValue,
    animationSpeed: config.animationSpeed,
    animationOriginX: config.animationOriginX,
    animationOriginY: config.animationOriginY,
  });
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

/**
 * Check and record rate limit for an IP using Redis
 * @param {string} ip - Client IP address
 * @returns {Promise<{allowed: boolean, remaining: number, waitTime: number}>}
 */
async function checkRateLimit(ip) {
  const client = await getRedis();
  const key = `${RATE_LIMIT_PREFIX}${ip}`;

  const count = await client.incr(key);

  // Set expiry on first request in window
  if (count === 1) {
    await client.expire(key, RATE_LIMIT_WINDOW);
  }

  if (count > RATE_LIMIT_MAX) {
    const ttl = await client.ttl(key);
    return { allowed: false, remaining: 0, waitTime: ttl > 0 ? ttl : RATE_LIMIT_WINDOW };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - count, waitTime: 0 };
}

/**
 * Check if a config already exists (duplicate detection)
 * @param {string} hash - Config hash
 * @returns {Promise<string|null>} Existing item ID or null
 */
async function findExistingByHash(hash) {
  const client = await getRedis();
  return await client.get(`${GALLERY_HASH_PREFIX}${hash}`);
}

function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.slice(0, MAX_TEXT_LENGTH).trim();
}

function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'Invalid config object' };
  }

  const { theme } = config;

  if (!theme || typeof theme !== 'string') {
    return { valid: false, error: 'Missing or invalid theme' };
  }

  // Validate numeric fields are within reasonable bounds
  const numericFields = {
    numLines: [1, 50],
    minWeight: [1, 100],
    maxWeight: [1, 100],
    widthValue: [50, 200],
    opszValue: [1, 200],
    animationSpeed: [0.1, 5],
  };

  for (const [field, [min, max]] of Object.entries(numericFields)) {
    if (field in config) {
      const value = config[field];
      if (typeof value !== 'number' || value < min || value > max) {
        return { valid: false, error: `Invalid ${field} value` };
      }
    }
  }

  return { valid: true };
}

/**
 * Get paginated gallery items using Redis sorted set + mGet
 * @param {number} offset - Start index
 * @param {number} limit - Number of items to fetch
 * @returns {Promise<{items: Array, total: number}>}
 */
async function getGalleryItems(offset, limit) {
  const client = await getRedis();

  // Get item IDs from sorted set (sorted by createdAt descending)
  const ids = await client.zRange(GALLERY_INDEX_KEY, offset, offset + limit - 1, { REV: true });

  if (ids.length === 0) {
    const total = await client.zCard(GALLERY_INDEX_KEY);
    return { items: [], total };
  }

  // Fetch all items in parallel
  const keys = ids.map((id) => `${GALLERY_ITEM_PREFIX}${id}`);
  const rawItems = await client.mGet(keys);

  // Parse JSON and filter out nulls
  const items = rawItems.filter((item) => item !== null).map((item) => JSON.parse(item));

  const total = await client.zCard(GALLERY_INDEX_KEY);

  return { items, total };
}

/**
 * Add a new item to the gallery
 * @param {Object} item - Gallery item with id, config, createdAt, hash, etc.
 */
async function addGalleryItem(item) {
  const client = await getRedis();
  const multi = client.multi();

  // Add to sorted set (score = createdAt for ordering)
  multi.zAdd(GALLERY_INDEX_KEY, { score: item.createdAt, value: item.id });

  // Store item data as JSON
  multi.set(`${GALLERY_ITEM_PREFIX}${item.id}`, JSON.stringify(item));

  // Store hash mapping for duplicate detection
  if (item.hash) {
    multi.set(`${GALLERY_HASH_PREFIX}${item.hash}`, item.id);
  }

  await multi.exec();
}

// GET /api/gallery - List gallery items
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { items, total } = await getGalleryItems(offset, limit);

    return Response.json({
      items,
      total,
      offset,
      limit,
    });
  } catch (error) {
    return errorResponse('GET', error, 'Failed to fetch gallery');
  }
}

// POST /api/gallery - Submit new artwork
export async function POST(request) {
  try {
    const body = await request.json();
    const { config } = body;

    const validation = validateConfig(config);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: `Please wait ${rateLimit.waitTime}s before submitting again` },
        { status: 429 }
      );
    }

    const configHash = hashConfig(config);
    const existingId = await findExistingByHash(configHash);

    if (existingId) {
      return Response.json({ success: true, id: existingId });
    }

    const item = {
      id: generateId(),
      hash: configHash,
      config: {
        ...config,
        text: sanitizeText(config.text),
      },
      createdAt: Date.now(),
      theme: config.theme,
      colorMode: config.colorMode || 'mono',
      textPreview: sanitizeText(config.text).slice(0, 20),
    };

    await addGalleryItem(item);

    return Response.json({ success: true, id: item.id });
  } catch (error) {
    return errorResponse('POST', error, 'Failed to submit artwork');
  }
}

export const config = runtimeConfig;
