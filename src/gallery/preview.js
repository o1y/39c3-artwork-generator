import { settings, themePresets } from '../config/settings.js';
import { CanvasRenderer } from '../rendering/core/canvas-renderer.js';

const PREVIEW_FPS = 15;
const PREVIEW_INTERVAL = 1000 / PREVIEW_FPS;

let animationId = null;
let lastFrameTime = 0;
let previewTime = 0;
let savedSettings = null;

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

export function startPreview(canvas, config) {
  if (config.isPaused) {
    return;
  }

  stopPreview();
  savedSettings = captureSettings();

  const ctx = canvas.getContext('2d');
  const renderer = new CanvasRenderer(ctx);
  const size = canvas.width;

  applyConfig(config, size);
  previewTime = config.time || 0;

  function animate(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= PREVIEW_INTERVAL) {
      previewTime += 0.0333 * (config.animationSpeed || 1);
      settings.time = previewTime;

      const preset = themePresets[settings.theme];
      if (preset) {
        preset.renderer(renderer, size);
      }

      lastFrameTime = timestamp - (elapsed % PREVIEW_INTERVAL);
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
