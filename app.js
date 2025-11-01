import { initCanvas } from './src/rendering/canvas.js';
import { setContext } from './src/rendering/weight.js';
import { animate } from './src/animation/loop.js';
import { initEventListeners, initDisplayValues } from './src/ui/events.js';

const { ctx } = initCanvas();

setContext(ctx);

initEventListeners();
initDisplayValues();

animate();
