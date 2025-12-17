import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadGallery,
  saveToGallery,
  deleteFromGallery,
  getGalleryItem,
  clearGallery,
} from '../../../src/gallery/storage.js';

describe('gallery/storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadGallery', () => {
    it('returns empty array when nothing stored', () => {
      expect(loadGallery()).toEqual([]);
    });

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem('39c3_gallery', 'not valid json');
      expect(loadGallery()).toEqual([]);
    });

    it('returns empty array when items is not an array', () => {
      localStorage.setItem('39c3_gallery', JSON.stringify({ items: 'not array' }));
      expect(loadGallery()).toEqual([]);
    });

    it('returns empty array when data has no items property', () => {
      localStorage.setItem('39c3_gallery', JSON.stringify({ something: 'else' }));
      expect(loadGallery()).toEqual([]);
    });

    it('returns stored items', () => {
      const items = [{ id: '1', config: { theme: 'lines' } }];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));
      expect(loadGallery()).toEqual(items);
    });

    it('returns multiple items in correct order', () => {
      const items = [
        { id: '1', config: { theme: 'lines' } },
        { id: '2', config: { theme: 'toggle' } },
        { id: '3', config: { theme: 'ccc' } },
      ];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));
      expect(loadGallery()).toEqual(items);
      expect(loadGallery()[0].id).toBe('1');
    });
  });

  describe('saveToGallery', () => {
    it('adds item to empty gallery', () => {
      const config = { theme: 'lines', text: 'TEST' };
      const thumbnail = 'data:image/png;base64,test';

      const result = saveToGallery(config, thumbnail);

      expect(result).not.toBeNull();
      expect(result.config).toEqual(config);
      expect(result.thumbnail).toBe(thumbnail);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(typeof result.createdAt).toBe('number');
    });

    it('adds item to front of existing gallery', () => {
      const existing = {
        id: 'old',
        config: { theme: 'old-theme' },
        thumbnail: 'old-thumb',
        createdAt: 1,
      };
      localStorage.setItem('39c3_gallery', JSON.stringify({ items: [existing] }));

      const newItem = saveToGallery({ theme: 'new-theme' }, 'new-thumb');
      const gallery = loadGallery();

      expect(gallery).toHaveLength(2);
      expect(gallery[0].id).toBe(newItem.id); // New item at front
      expect(gallery[1].id).toBe('old');
    });

    it('generates unique IDs for each item', () => {
      const item1 = saveToGallery({ theme: 'theme1' }, 'thumb1');
      const item2 = saveToGallery({ theme: 'theme2' }, 'thumb2');

      expect(item1.id).not.toBe(item2.id);
    });

    it('persists items to localStorage', () => {
      saveToGallery({ theme: 'test' }, 'thumbnail');

      // Verify by reading raw localStorage
      const stored = JSON.parse(localStorage.getItem('39c3_gallery'));
      expect(stored.items).toHaveLength(1);
      expect(stored.items[0].config.theme).toBe('test');
    });
  });

  describe('deleteFromGallery', () => {
    it('removes item by id', () => {
      const items = [
        { id: '1', config: {}, thumbnail: '', createdAt: 1 },
        { id: '2', config: {}, thumbnail: '', createdAt: 2 },
      ];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      const result = deleteFromGallery('1');

      expect(result).toBe(true);
      expect(loadGallery()).toHaveLength(1);
      expect(loadGallery()[0].id).toBe('2');
    });

    it('returns false for non-existent id', () => {
      const items = [{ id: '1', config: {}, thumbnail: '', createdAt: 1 }];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      expect(deleteFromGallery('nonexistent')).toBe(false);
    });

    it('returns false when gallery is empty', () => {
      expect(deleteFromGallery('any-id')).toBe(false);
    });

    it('can delete all items one by one', () => {
      const items = [
        { id: '1', config: {}, thumbnail: '', createdAt: 1 },
        { id: '2', config: {}, thumbnail: '', createdAt: 2 },
      ];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      expect(deleteFromGallery('1')).toBe(true);
      expect(deleteFromGallery('2')).toBe(true);
      expect(loadGallery()).toHaveLength(0);
    });
  });

  describe('getGalleryItem', () => {
    it('returns item by id', () => {
      const items = [{ id: '1', config: { theme: 'test' }, thumbnail: 'thumb', createdAt: 1 }];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      const item = getGalleryItem('1');

      expect(item).toEqual(items[0]);
    });

    it('returns null for non-existent id', () => {
      const items = [{ id: '1', config: {}, thumbnail: '', createdAt: 1 }];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      expect(getGalleryItem('nonexistent')).toBeNull();
    });

    it('returns null when gallery is empty', () => {
      expect(getGalleryItem('any-id')).toBeNull();
    });

    it('finds item among multiple items', () => {
      const items = [
        { id: '1', config: { theme: 'first' }, thumbnail: '', createdAt: 1 },
        { id: '2', config: { theme: 'second' }, thumbnail: '', createdAt: 2 },
        { id: '3', config: { theme: 'third' }, thumbnail: '', createdAt: 3 },
      ];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      const item = getGalleryItem('2');
      expect(item.config.theme).toBe('second');
    });
  });

  describe('clearGallery', () => {
    it('removes storage key', () => {
      localStorage.setItem('39c3_gallery', JSON.stringify({ items: [] }));

      const result = clearGallery();

      expect(result).toBe(true);
      expect(localStorage.getItem('39c3_gallery')).toBeNull();
    });

    it('returns true even if gallery was already empty', () => {
      expect(clearGallery()).toBe(true);
    });

    it('clears all items', () => {
      const items = [
        { id: '1', config: {}, thumbnail: '', createdAt: 1 },
        { id: '2', config: {}, thumbnail: '', createdAt: 2 },
      ];
      localStorage.setItem('39c3_gallery', JSON.stringify({ items }));

      clearGallery();

      expect(loadGallery()).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('does not throw when called with valid parameters', () => {
      // Just verify that the function handles normal operations without throwing
      expect(() => saveToGallery({ theme: 'test' }, 'data')).not.toThrow();
      expect(() => loadGallery()).not.toThrow();
      expect(() => deleteFromGallery('nonexistent')).not.toThrow();
      expect(() => clearGallery()).not.toThrow();
    });

    it('handles items with complex config objects', () => {
      const complexConfig = {
        theme: 'lines',
        text: 'Hello',
        colorMode: 'violet-inv',
        numLines: 11,
        nested: { a: 1, b: [1, 2, 3] },
      };

      const result = saveToGallery(complexConfig, 'thumb');
      const loaded = getGalleryItem(result.id);

      expect(loaded.config).toEqual(complexConfig);
    });
  });
});
