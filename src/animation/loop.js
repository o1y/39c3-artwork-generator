import { settings, themePresets } from '../config/settings.js';
import { getCanvas, getContext } from '../rendering/canvas.js';
import { CanvasRenderer } from '../rendering/core/canvas-renderer.js';

const targetFPS = 30;
const frameInterval = 1000 / targetFPS;
let lastFrameTime = performance.now();
let isPaused = false;
let pausedByVisibility = false;
let cachedRenderer = null;
let cachedCtx = null;

function render() {
  const canvas = getCanvas();
  const ctx = getContext();

  if (ctx !== cachedCtx) {
    cachedCtx = ctx;
    cachedRenderer = new CanvasRenderer(ctx);
  }

  const preset = themePresets[settings.theme];
  preset.renderer(cachedRenderer, canvas.width);
}

export function animate() {
  if (isPaused) return;

  const now = performance.now();
  const elapsed = now - lastFrameTime;

  if (elapsed >= frameInterval) {
    settings.time += 0.0333;
    render();
    lastFrameTime = now - (elapsed % frameInterval);
  }

  requestAnimationFrame(animate);
}

export function pauseAnimation() {
  isPaused = true;
}

export function resumeAnimation() {
  isPaused = false;
  lastFrameTime = performance.now();
  requestAnimationFrame(animate);
}

export function getIsPaused() {
  return isPaused;
}

export function setFramePosition(time) {
  settings.time = time;
  if (isPaused) {
    render();
  }
}

export { render };

export function initVisibilityHandler() {
  if (document.hidden) {
    pausedByVisibility = true;
    isPaused = true;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!isPaused) {
        pausedByVisibility = true;
        isPaused = true;
      }
    } else if (pausedByVisibility) {
      pausedByVisibility = false;
      resumeAnimation();
    }
  });
}
