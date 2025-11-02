import { settings } from '../config/settings.js';
import { renderToggleTheme } from '../rendering/toggle.js';
import { renderLinesTheme } from '../rendering/lines.js';
import { renderCCCTheme } from '../rendering/ccc.js';
import { getCanvas } from '../rendering/canvas.js';

const targetFPS = 30;
const frameInterval = 1000 / targetFPS;
let lastFrameTime = performance.now();
let frameCount = 0;
let lastFPSUpdate = performance.now();
let fps = 30;

function render() {
  const canvas = getCanvas();

  if (settings.theme === 'toggle') {
    renderToggleTheme(canvas);
  } else if (settings.theme === 'ccc') {
    renderCCCTheme(canvas);
  } else {
    renderLinesTheme(canvas);
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
