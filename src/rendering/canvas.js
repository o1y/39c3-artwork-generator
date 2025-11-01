import { settings } from '../config/settings.js';

export let canvas = null;
export let ctx = null;

export function initCanvas() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d', { alpha: false });

  canvas.width = settings.canvasSize;
  canvas.height = settings.canvasSize;

  return { canvas, ctx };
}

export function setCanvas(newCanvas, newCtx) {
  canvas = newCanvas;
  ctx = newCtx;
}

export function getCanvas() {
  return canvas;
}

export function getContext() {
  return ctx;
}
