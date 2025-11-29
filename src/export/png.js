import { settings } from '../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { render } from '../animation/loop.js';
import { generateFilename } from './filename.js';

export function exportPNG(resolution = 2) {
  const originalSize = settings.canvasSize;

  // Create temporary high-res canvas
  const tempCanvas = document.createElement('canvas');
  const highResSize = originalSize * resolution;
  tempCanvas.width = highResSize;
  tempCanvas.height = highResSize;

  // Attach to DOM. Required to fix font rendering in detached canvases
  tempCanvas.style.position = 'absolute';
  tempCanvas.style.left = '-9999px';
  tempCanvas.style.top = '-9999px';
  document.body.appendChild(tempCanvas);

  const tempCtx = tempCanvas.getContext('2d', { alpha: false });

  // Temporarily scale settings
  const originalCanvasSize = settings.canvasSize;
  const originalMargin = settings.margin;
  settings.canvasSize = highResSize;
  settings.margin = settings.margin * resolution;

  // Store original references
  const originalCanvas = getCanvas();
  const originalCtx = getContext();

  // Temporarily swap canvas context
  setCanvas(tempCanvas, tempCtx);

  // Render current frame at high resolution
  render();

  // Restore original canvas and settings
  setCanvas(originalCanvas, originalCtx);
  settings.canvasSize = originalCanvasSize;
  settings.margin = originalMargin;

  // Download
  tempCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = generateFilename('png');
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // Clean up: remove temporary canvas from DOM
    document.body.removeChild(tempCanvas);
  }, 'image/png');
}
