import { settings } from '../config/settings.js';
import { renderToggleTheme } from '../rendering/themes/toggle.js';
import { renderToggle39C3Theme } from '../rendering/themes/toggle39c3.js';
import { renderLinesTheme } from '../rendering/themes/lines.js';
import { renderCCCTheme } from '../rendering/themes/ccc.js';
import { getCanvas, getContext } from '../rendering/canvas.js';
import { CanvasRenderer } from '../rendering/core/canvas-renderer.js';

const targetFPS = 30;
const frameInterval = 1000 / targetFPS;
let lastFrameTime = performance.now();
let frameCount = 0;
let lastFPSUpdate = performance.now();
let fps = 30;

function render() {
  const canvas = getCanvas();
  const ctx = getContext();
  const renderer = new CanvasRenderer(ctx);

  if (settings.theme.startsWith('toggle39c3')) {
    renderToggle39C3Theme(renderer, canvas.width);
  } else if (settings.theme.startsWith('toggle')) {
    renderToggleTheme(renderer, canvas.width);
  } else if (settings.theme === 'ccc') {
    renderCCCTheme(renderer, canvas.width);
  } else {
    renderLinesTheme(renderer, canvas.width);
  }
}

export function animate() {
  const now = performance.now();
  const elapsed = now - lastFrameTime;

  // Throttle to target FPS
  if (elapsed >= frameInterval) {
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

// Export render function for use in export functionality
export { render };
