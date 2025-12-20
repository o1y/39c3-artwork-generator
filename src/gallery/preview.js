import { settings, themePresets } from '../config/settings.js';
import { CanvasRenderer } from '../rendering/core/canvas-renderer.js';
import { ANIMATION_FPS } from '../ui/state/constants.js';

export const THUMBNAIL_FPS = 15;
export const LIGHTBOX_FPS = 30;

let animationId = null;
let lastFrameTime = 0;
let previewTime = 0;
let savedSettings = null;
let currentFps = THUMBNAIL_FPS;

function captureSettings() {
  return {
    theme: settings.theme,
    text: settings.text,
    colorMode: settings.colorMode,
    mode: settings.mode,
    animationSpeed: settings.animationSpeed,
    minWeight: settings.minWeight,
    maxWeight: settings.maxWeight,
    staticWeight: settings.staticWeight,
    widthValue: settings.widthValue,
    opszValue: settings.opszValue,
    numLines: settings.numLines,
    canvasSize: settings.canvasSize,
    margin: settings.margin,
    time: settings.time,
    animationOriginX: settings.animationOriginX,
    animationOriginY: settings.animationOriginY,
    animationPhaseOffset: settings.animationPhaseOffset,
  };
}

function restoreSettings(saved) {
  Object.assign(settings, saved);
}

function applyConfig(config, canvasSize) {
  for (const [key, value] of Object.entries(config)) {
    if (key in settings) {
      settings[key] = value;
    }
  }

  const scaleFactor = canvasSize / 800;
  settings.canvasSize = canvasSize;
  settings.margin = (config.margin || 40) * scaleFactor;
}

export function startPreview(canvas, config, fps = THUMBNAIL_FPS) {
  stopPreview();
  savedSettings = captureSettings();
  currentFps = fps;

  const ctx = canvas.getContext('2d');
  const renderer = new CanvasRenderer(ctx);
  const size = canvas.width;

  applyConfig(config, size);

  previewTime = config.currentFrame !== undefined ? config.currentFrame / ANIMATION_FPS : 0;

  // For paused configs, render once and return
  if (config.isPaused) {
    settings.time = previewTime;
    const preset = themePresets[settings.theme];
    if (preset) {
      preset.renderer(renderer, size);
    }
    return;
  }

  const frameInterval = 1000 / currentFps;

  function animate(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= frameInterval) {
      previewTime += 0.0333 * (config.animationSpeed || 1);
      settings.time = previewTime;

      const preset = themePresets[settings.theme];
      if (preset) {
        preset.renderer(renderer, size);
      }

      lastFrameTime = timestamp - (elapsed % frameInterval);
    }

    animationId = requestAnimationFrame(animate);
  }

  lastFrameTime = 0;
  animationId = requestAnimationFrame(animate);
}

export function stopPreview() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (savedSettings) {
    restoreSettings(savedSettings);
    savedSettings = null;
  }

  lastFrameTime = 0;
  previewTime = 0;
}
