import { settings, themePresets } from '../../config/settings.js';
import { setFramePosition, getIsPaused, render } from '../../animation/loop.js';

export function setupWatchers(store) {
  store.$watch('text', (value) => {
    const upperValue = value.toUpperCase();
    if (value !== upperValue) {
      store.$nextTick(() => {
        store.text = upperValue;
      });
    }
    settings.text = upperValue;
    if (store.isPaused) render();
  });

  store.$watch('theme', (value) => {
    store.onThemeChange(value);
    if (store.isPaused) render();
  });

  store.$watch('toggleVariant', (value) => {
    settings.toggleVariant = value;
    if (store.isPaused) render();
  });

  store.$watch('colorMode', (value) => {
    settings.colorMode = value;
    const preset = themePresets[store.theme];
    if (preset && preset.colorMode && value !== preset.colorMode) {
      store.isColorModeDirty = true;
    }
    if (store.isPaused) render();
  });

  store.$watch('numLines', (value) => {
    settings.numLines = value;
    if (store.isPaused) render();
  });

  store.$watch('animationSpeed', (value) => {
    settings.animationSpeed = value;
    if (store.isPaused) render();
  });

  store.$watch('mode', (value) => {
    settings.mode = value;
    if (store.isPaused) render();
  });

  store.$watch('framePosition', (value) => {
    if (store.isPaused) {
      setFramePosition(value);
    }
  });
}

export function startFrameUpdateLoop(store) {
  const updateFramePosition = () => {
    if (!store.isPaused) {
      store.framePosition = settings.time % 10;
    }
    store.isPaused = getIsPaused();
    requestAnimationFrame(updateFramePosition);
  };
  requestAnimationFrame(updateFramePosition);
}
