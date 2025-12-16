const STORAGE_KEY = '39c3_gallery';

function generateId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function loadGallery() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return Array.isArray(data.items) ? data.items : [];
    }
  } catch {
    return [];
  }
  return [];
}

function saveGalleryData(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    return true;
  } catch {
    return false;
  }
}

export function saveToGallery(config, thumbnail) {
  const items = loadGallery();
  const newItem = {
    id: generateId(),
    createdAt: Date.now(),
    thumbnail,
    config,
  };
  items.unshift(newItem);
  const success = saveGalleryData(items);
  return success ? newItem : null;
}

export function deleteFromGallery(id) {
  const items = loadGallery();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length !== items.length) {
    return saveGalleryData(filtered);
  }
  return false;
}

export function getGalleryItem(id) {
  const items = loadGallery();
  return items.find((item) => item.id === id) || null;
}

export function clearGallery() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
