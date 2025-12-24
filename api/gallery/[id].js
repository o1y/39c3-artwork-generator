/* global process */
import {
  getRedis,
  GALLERY_INDEX_KEY,
  GALLERY_ITEM_PREFIX,
  errorResponse,
  runtimeConfig,
} from '../utils/redis.js';

function extractId(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1];
}

// DELETE /api/gallery/[id]
//   curl -X DELETE -H "x-admin-secret: ..." /api/gallery/[id]
export async function DELETE(request) {
  try {
    const id = extractId(request);

    if (
      !process.env.ADMIN_SECRET ||
      request.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET
    ) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getRedis();

    const rawItem = await client.get(`${GALLERY_ITEM_PREFIX}${id}`);
    if (!rawItem) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    const multi = client.multi();
    multi.zRem(GALLERY_INDEX_KEY, id);
    multi.del(`${GALLERY_ITEM_PREFIX}${id}`);
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
