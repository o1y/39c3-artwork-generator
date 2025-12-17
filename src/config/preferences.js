const STORAGE_KEY = '39c3_preferences';

const DEFAULT_PREFERENCES = {
  dismissedHints: {
    toolbar: false,
    spotlight: false,
  },
};

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (_e) {
    // Invalid JSON, return defaults
  }
  return { ...DEFAULT_PREFERENCES };
}

function save(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (_e) {
    // Storage full or unavailable
  }
}

function get(path) {
  const prefs = load();
  return path.split('.').reduce((obj, key) => obj?.[key], prefs);
}

function set(path, value) {
  const prefs = load();
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, prefs);
  target[lastKey] = value;
  save(prefs);
}

export const preferences = { load, save, get, set };
