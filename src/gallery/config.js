import { KEY_MAP, isKeyRelevant } from '../config/url-keys.js';
import { settings } from '../config/settings.js';

const CONFIG_KEYS = Object.keys(KEY_MAP);

export function captureArtworkConfig(store) {
  const config = {};
  const currentTheme = store.theme ?? settings.theme;

  for (const key of CONFIG_KEYS) {
    if (!isKeyRelevant(key, currentTheme, store)) continue;

    let value = store[key] ?? settings[key];
    if (value === undefined || value === null) continue;

    if (
      key === 'animationOriginX' ||
      key === 'animationOriginY' ||
      key === 'animationPhaseOffset'
    ) {
      value = Math.round(value * 10000) / 10000;
    }

    config[key] = value;
  }

  return config;
}

export function restoreArtworkConfig(config, store) {
  for (const key of CONFIG_KEYS) {
    if (key in config) {
      store[key] = config[key];
      if (key in settings) {
        settings[key] = config[key];
      }
    }
  }
}
