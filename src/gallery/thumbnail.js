import { settings, themePresets } from '../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { CanvasRenderer } from '../rendering/core/canvas-renderer.js';

const THUMBNAIL_SIZE = 200;

export function generateThumbnail() {
  const originalCanvas = getCanvas();
  const originalCtx = getContext();
  const savedState = {
    canvasSize: settings.canvasSize,
    margin: settings.margin,
  };

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = THUMBNAIL_SIZE;
  thumbCanvas.height = THUMBNAIL_SIZE;
  const thumbCtx = thumbCanvas.getContext('2d');
  const scaleFactor = THUMBNAIL_SIZE / savedState.canvasSize;

  settings.canvasSize = THUMBNAIL_SIZE;
  settings.margin = savedState.margin * scaleFactor;

  setCanvas(thumbCanvas, thumbCtx);
  const renderer = new CanvasRenderer(thumbCtx);
  const preset = themePresets[settings.theme];
  preset.renderer(renderer, THUMBNAIL_SIZE);

  setCanvas(originalCanvas, originalCtx);
  settings.canvasSize = savedState.canvasSize;
  settings.margin = savedState.margin;

  return thumbCanvas.toDataURL('image/png');
}
