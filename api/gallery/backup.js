/* global process */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import {
  getRedis,
  GALLERY_INDEX_KEY,
  GALLERY_ITEM_PREFIX,
  errorResponse,
  runtimeConfig,
} from '../utils/redis.js';

const BACKUP_DIR = join(process.cwd(), 'backups');

function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// GET /api/gallery/backup
//   curl -H "x-admin-secret: ..." /api/gallery/backup
export async function GET(request) {
  try {
    if (
      !process.env.ADMIN_SECRET ||
      request.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET
    ) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getRedis();

    const ids = await client.zRange(GALLERY_INDEX_KEY, 0, -1, { REV: true });

    const keys = ids.map((id) => `${GALLERY_ITEM_PREFIX}${id}`);
    const rawItems = keys.length ? await client.mGet(keys) : [];
    const items = rawItems.filter(Boolean).map((item) => JSON.parse(item));

    const backup = {
      exportedAt: new Date().toISOString(),
      totalItems: items.length,
      items,
    };

    ensureBackupDir();
    const filename = `backup-${Date.now()}.json`;
    const filepath = join(BACKUP_DIR, filename);
    writeFileSync(filepath, JSON.stringify(backup, null, 2));

    return Response.json({
      success: true,
      filename,
      itemCount: items.length,
    });
  } catch (error) {
    return errorResponse('BACKUP', error, 'Failed to create backup');
  }
}

// POST /api/gallery/backup - Restore from backup
//   curl -X POST -H "x-admin-secret: ..." -H "Content-Type: application/json" \
//     -d '{"filename": "backup-123.json"}' /api/gallery/backup
export async function POST(request) {
  try {
    if (
      !process.env.ADMIN_SECRET ||
      request.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET
    ) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await request.json();

    if (!filename) {
      return Response.json({ error: 'filename is required' }, { status: 400 });
    }

    const sanitizedFilename = basename(filename);
    const filepath = join(BACKUP_DIR, sanitizedFilename);
    if (!existsSync(filepath)) {
      return Response.json({ error: `Backup file not found: ${filename}` }, { status: 404 });
    }

    const backup = JSON.parse(readFileSync(filepath, 'utf-8'));
    const client = await getRedis();

    // Clear existing gallery data
    const existingKeys = await client.keys('gallery:*');
    if (existingKeys.length) {
      await client.del(existingKeys);
    }

    const multi = client.multi();

    for (const item of backup.items) {
      multi.zAdd(GALLERY_INDEX_KEY, { score: item.createdAt, value: item.id });
      multi.set(`${GALLERY_ITEM_PREFIX}${item.id}`, JSON.stringify(item));
    }

    await multi.exec();

    return Response.json({
      success: true,
      restoredItems: backup.items.length,
    });
  } catch (error) {
    return errorResponse('RESTORE', error, 'Failed to restore backup');
  }
}

export const config = runtimeConfig;
