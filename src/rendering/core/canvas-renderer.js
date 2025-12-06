import { Renderer } from './renderer-interface.js';
import {
  textToPath,
  getTextWidth,
  getMiddleBaselineOffset,
  getAscenderHeight,
} from '../../export/font-loader.js';

export class CanvasRenderer extends Renderer {
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }

  drawBackground(width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, width, height);
  }

  measureText(text, fontSize, weight, width) {
    return getTextWidth(text, fontSize, weight, width);
  }

  drawText(text, x, y, fontSize, weight, color, options = {}) {
    let adjustedY = y;

    if (options.baseline === 'middle') {
      const offset = getMiddleBaselineOffset(fontSize);
      adjustedY = y + offset;
    } else if (options.baseline === 'top') {
      const ascender = getAscenderHeight(fontSize);
      adjustedY = y + ascender;
    }

    const width = options.width;
    const result = textToPath(text, x, adjustedY, fontSize, weight, width);

    this.ctx.fillStyle = color;
    this.ctx.fill(new Path2D(result.pathData));
  }

  drawPath(pathData, color) {
    this.ctx.fillStyle = color;
    this.ctx.fill(new Path2D(pathData));
  }

  drawRect(x, y, width, height, fillColor) {
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);
  }

  drawCircle(cx, cy, r, fillColor = null, strokeColor = null, strokeWidth = 1) {
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  beginPath() {
    this.ctx.beginPath();
  }

  arc(x, y, radius, startAngle, endAngle) {
    this.ctx.arc(x, y, radius, startAngle, endAngle);
  }

  closePath() {
    this.ctx.closePath();
  }

  fill(color) {
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  stroke(color, width) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  save() {
    this.ctx.save();
  }

  restore() {
    this.ctx.restore();
  }

  translate(x, y) {
    this.ctx.translate(x, y);
  }

  scale(x, y) {
    this.ctx.scale(x, y);
  }

  createOffscreen(width, height) {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { alpha: true });
    return {
      renderer: new CanvasRenderer(offCtx),
      canvas: offscreen,
    };
  }

  drawOffscreen(offscreenData, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.ctx.drawImage(offscreenData.canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  getTarget() {
    return this.ctx.canvas;
  }
}
