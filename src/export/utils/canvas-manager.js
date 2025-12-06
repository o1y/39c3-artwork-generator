import { settings } from '../../config/settings.js';

function calculateScaledSize(baseSize, resolution) {
  return baseSize * resolution;
}

export function createTempCanvas(resolution, attachToDOM = true, alpha = false) {
  const tempCanvas = document.createElement('canvas');
  const scaledSize = calculateScaledSize(settings.canvasSize, resolution);

  tempCanvas.width = scaledSize;
  tempCanvas.height = scaledSize;

  if (attachToDOM) {
    attachCanvasToDOM(tempCanvas);
  }

  const context = tempCanvas.getContext('2d', { alpha });

  return { canvas: tempCanvas, context, scaledSize };
}

function attachCanvasToDOM(canvas) {
  canvas.style.position = 'absolute';
  canvas.style.left = '-9999px';
  canvas.style.top = '-9999px';
  document.body.appendChild(canvas);
}

export function cleanupTempCanvas(canvas) {
  if (canvas && canvas.parentNode) {
    document.body.removeChild(canvas);
  }
}

export function calculateGifScale(resolution) {
  return resolution / settings.canvasSize;
}
