import { vi, beforeEach, afterEach } from 'vitest';

// Mock requestAnimationFrame and cancelAnimationFrame
vi.stubGlobal(
  'requestAnimationFrame',
  vi.fn((cb) => setTimeout(cb, 16))
);
vi.stubGlobal(
  'cancelAnimationFrame',
  vi.fn((id) => clearTimeout(id))
);

// Mock crypto.randomUUID for gallery ID generation
vi.stubGlobal('crypto', {
  randomUUID: vi.fn().mockImplementation(() => 'test-uuid-' + Math.random().toString(36).slice(2)),
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});
