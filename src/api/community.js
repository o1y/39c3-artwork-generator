const API_BASE = '/api/gallery';

async function handleResponse(response, errorMessage) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `${errorMessage}: ${response.status}`);
  }
  return response.json();
}

export async function fetchGalleryItems({ limit = 50, offset = 0 } = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());
  return handleResponse(await fetch(url), 'Failed to fetch gallery');
}

export async function submitToGallery(config) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config }),
  });
  return handleResponse(response, 'Failed to submit');
}

export async function fetchGalleryItem(id) {
  return handleResponse(await fetch(`${API_BASE}/${id}`), 'Failed to fetch item');
}

export async function deleteGalleryItem(id) {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  return handleResponse(response, 'Failed to delete');
}

export function isDevMode() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
