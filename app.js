import Alpine from 'alpinejs';
import { initCanvas } from './src/rendering/canvas.js';
import { animate, render } from './src/animation/loop.js';
import { createAppStore } from './src/ui/state/index.js';
import { loadFont } from './src/export/font-loader.js';

window.Alpine = Alpine;
Alpine.data('appStore', createAppStore);
Alpine.start();

initCanvas();

// Load font before starting animation
loadFont()
  .then(() => {
    render(); // Initial render (needed if paused from URL params)
    animate();
  })
  .catch((error) => {
    console.error('Failed to load font, starting animation anyway:', error);
    render();
    animate();
  });
