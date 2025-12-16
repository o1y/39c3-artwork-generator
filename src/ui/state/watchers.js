import { settings, themePresets } from '../../config/settings.js';
import { setFramePosition, getIsPaused, render } from '../../animation/loop.js';
import { ANIMATION_FPS } from './constants.js';

export function setupWatchers(store) {
  store.$watch('text', (value) => {
    const preset = themePresets[store.theme];
    const forceUppercase = preset?.forceUppercase !== false;

    if (forceUppercase) {
      const upperValue = value.toUpperCase();
      if (value !== upperValue) {
        store.$nextTick(() => {
          store.text = upperValue;
        });
      }
      settings.text = upperValue;
    } else {
      settings.text = value;
    }
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

  store.$watch('widthValue', (value) => {
    settings.widthValue = value;
    if (store.isPaused) render();
  });

  store.$watch('opszValue', (value) => {
    settings.opszValue = value;
    if (store.isPaused) render();
  });

  store.$watch('minWeight', (value) => {
    settings.minWeight = value;
    if (store.isPaused) render();
  });

  store.$watch('maxWeight', (value) => {
    settings.maxWeight = value;
    if (store.isPaused) render();
  });

  store.$watch('staticWeight', (value) => {
    settings.staticWeight = value;
    if (store.isPaused) render();
  });

  store.$watch('animationSpeed', (value) => {
    settings.animationSpeed = value;

    // Reset exportLoops if current selection is no longer available
    const availableLoops = store.availableDurations.map((d) => d.value);
    if (!availableLoops.includes(store.exportLoops)) {
      store.exportLoops = availableLoops[0];
    }

    if (store.isPaused) render();
  });

  store.$watch('mode', (value) => {
    settings.mode = value;
    if (store.isPaused) render();
  });

  store.$watch('animationOriginX', (value) => {
    settings.animationOriginX = value;
    if (store.isPaused) render();
  });

  store.$watch('animationOriginY', (value) => {
    settings.animationOriginY = value;
    if (store.isPaused) render();
  });

  store.$watch('animationPhaseOffset', (value) => {
    settings.animationPhaseOffset = value;
    if (store.isPaused) render();
  });

  store.$watch('exportFormat', (value) => {
    // Reset exportResolution if current selection is no longer available
    const availableResolutions = store.availableResolutions.map((r) => r.value);
    if (!availableResolutions.includes(store.exportResolution)) {
      // Default to 1000px for GIF, 2x for others
      store.exportResolution = value === 'gif' ? '1000' : '2';
    }
  });

  store.$watch('currentFrame', (value) => {
    if (store.isPaused) {
      const time = value / ANIMATION_FPS;
      setFramePosition(time);
    }
  });
}

export function startFrameUpdateLoop(store) {
  const updateFramePosition = () => {
    if (!store.isPaused) {
      const maxFrames = store.maxFrames;
      const frameNumber = Math.floor(settings.time * ANIMATION_FPS) % maxFrames;
      store.currentFrame = frameNumber;
    }
    store.isPaused = getIsPaused();
    requestAnimationFrame(updateFramePosition);
  };
  requestAnimationFrame(updateFramePosition);
}
