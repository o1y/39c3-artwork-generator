/* global process */
import {
  getRedis,
  GALLERY_INDEX_KEY,
  GALLERY_ITEM_PREFIX,
  GALLERY_HASH_PREFIX,
  errorResponse,
  runtimeConfig,
} from '../utils/redis.js';

function extractId(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1];
}

// DELETE /api/gallery/[id] - Dev mode only
export async function DELETE(request) {
  try {
    const id = extractId(request);

    if (process.env.VERCEL_ENV === 'production') {
      return Response.json({ error: 'Delete not available in production' }, { status: 403 });
    }

    const client = await getRedis();

    const rawItem = await client.get(`${GALLERY_ITEM_PREFIX}${id}`);
    if (!rawItem) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = JSON.parse(rawItem);

    const multi = client.multi();
    multi.zRem(GALLERY_INDEX_KEY, id);
    multi.del(`${GALLERY_ITEM_PREFIX}${id}`);
    if (item.hash) {
      multi.del(`${GALLERY_HASH_PREFIX}${item.hash}`);
    }
    await multi.exec();

    return Response.json({ success: true, deleted: id });
  } catch (error) {
    return errorResponse('DELETE', error, 'Failed to delete item');
  }
}

// GET /api/gallery/[id] - Get single item
export async function GET(request) {
  try {
    const id = extractId(request);

    const client = await getRedis();
    const rawItem = await client.get(`${GALLERY_ITEM_PREFIX}${id}`);

    if (!rawItem) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = JSON.parse(rawItem);
    return Response.json({ item });
  } catch (error) {
    return errorResponse('GET single', error, 'Failed to fetch item');
  }
}

export const config = runtimeConfig;
