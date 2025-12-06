import { settings } from '../config/settings.js';
import { renderToggleTheme } from '../rendering/themes/toggle.js';
import { renderLinesTheme } from '../rendering/themes/lines.js';
import { renderCCCTheme } from '../rendering/themes/ccc.js';
import { renderTerminalTheme } from '../rendering/themes/terminal.js';
import { renderDVDTheme } from '../rendering/themes/dvd.js';
import { getCanvas, getContext } from '../rendering/canvas.js';
import { CanvasRenderer } from '../rendering/core/canvas-renderer.js';

const targetFPS = 30;
const frameInterval = 1000 / targetFPS;
let lastFrameTime = performance.now();
let frameCount = 0;
let lastFPSUpdate = performance.now();
let fps = 30;
let isPaused = false;
let pausedByVisibility = false;

function render() {
  const canvas = getCanvas();
  const ctx = getContext();
  const renderer = new CanvasRenderer(ctx);

  if (settings.theme.startsWith('toggle')) {
    renderToggleTheme(renderer, canvas.width);
  } else if (settings.theme === 'ccc') {
    renderCCCTheme(renderer, canvas.width);
  } else if (settings.theme === 'terminal') {
    renderTerminalTheme(renderer, canvas.width);
  } else if (settings.theme === 'dvd') {
    renderDVDTheme(renderer, canvas.width);
  } else {
    renderLinesTheme(renderer, canvas.width);
  }
}

export function animate() {
  const now = performance.now();
  const elapsed = now - lastFrameTime;

  // Throttle to target FPS
  if (!isPaused && elapsed >= frameInterval) {
    settings.time += 0.0333; // ~30fps time increment
    render();
    lastFrameTime = now - (elapsed % frameInterval);

    // Calculate FPS
    frameCount++;
    if (now - lastFPSUpdate >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFPSUpdate = now;
      document.getElementById('fps').textContent = fps;
    }
  }

  requestAnimationFrame(animate);
}

export function pauseAnimation() {
  isPaused = true;
}

export function resumeAnimation() {
  isPaused = false;
  lastFrameTime = performance.now();
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

// Export render function for use in export functionality
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
