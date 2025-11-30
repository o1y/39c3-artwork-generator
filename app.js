import Alpine from 'alpinejs';
import { initCanvas } from './src/rendering/canvas.js';
import { setContext } from './src/rendering/weight.js';
import { animate } from './src/animation/loop.js';
import { createAppStore } from './src/ui/state/index.js';

window.Alpine = Alpine;
Alpine.data('appStore', createAppStore);
Alpine.start();

const { ctx } = initCanvas();
setContext(ctx);
animate();
