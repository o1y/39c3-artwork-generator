import { settings } from '../config/settings.js';
import { renderToggleTheme } from '../rendering/toggle.js';
import { renderLinesTheme } from '../rendering/lines.js';
import { getCanvas } from '../rendering/canvas.js';

let frameCount = 0;
let lastFrameTime = performance.now();
let fps = 60;

function render() {
  const canvas = getCanvas();

  if (settings.theme === 'toggle') {
    renderToggleTheme(canvas);
  } else {
    renderLinesTheme(canvas);
  }
}

export function animate() {
  settings.time += 0.016; // ~60fps time increment
  render();

  // Calculate FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFrameTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = now;
    document.getElementById('fps').textContent = fps;
  }
  document.getElementById('frame').textContent = Math.floor(settings.time * 60);

  requestAnimationFrame(animate);
}

// Export render function for use in export functionality
export { render };
