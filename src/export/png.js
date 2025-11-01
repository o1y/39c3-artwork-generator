import { settings } from '../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { render } from '../animation/loop.js';
import { generateFilename } from './filename.js';

export function exportPNG() {
  const resolution = parseInt(document.getElementById('exportResolution').value);
  const originalSize = settings.canvasSize;

  // Create temporary high-res canvas
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { alpha: false });
  const highResSize = originalSize * resolution;

  tempCanvas.width = highResSize;
  tempCanvas.height = highResSize;

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
  }, 'image/png');
}
