import Alpine from 'alpinejs';
import { initCanvas } from './src/rendering/canvas.js';
import { setContext } from './src/rendering/weight.js';
import { animate } from './src/animation/loop.js';
import { createAppStore } from './src/ui/state/index.js';
import { loadFont } from './src/export/font-loader.js';

window.Alpine = Alpine;
Alpine.data('appStore', createAppStore);
Alpine.start();

const { ctx } = initCanvas();
setContext(ctx);

// Load font before starting animation
loadFont()
  .then(() => {
    animate();
  })
  .catch((error) => {
    console.error('Failed to load font, starting animation anyway:', error);
    animate();
  });
