import { Renderer } from './renderer-interface.js';
import { settings } from '../../config/settings.js';
import { calculatePillDimensions, calculateDotPosition } from '../utils/pill-utils.js';

export class CanvasRenderer extends Renderer {
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }

  clearCanvas(width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, width, height);
  }

  measureText(text, fontSize, weight) {
    this.ctx.font = `${weight} ${fontSize}px Kario39C3`;
    const metrics = this.ctx.measureText(text);
    return metrics.width;
  }

  drawText(text, x, y, fontSize, weight, color, options = {}) {
    this.ctx.font = `${weight} ${fontSize}px Kario39C3`;
    this.ctx.fillStyle = color;

    if (options.baseline) {
      this.ctx.textBaseline = options.baseline;
    }

    this.ctx.fillText(text, x, y);
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

  drawTogglePill(x, y, fontSize, color, time, phase, useConstantSpeed, pillStyle, bgColor) {
    const { height, width, radius, strokeWidth, dotRadius } = calculatePillDimensions(fontSize);

    if (pillStyle === 'filled') {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x + radius, y + radius, radius, Math.PI / 2, Math.PI * 1.5);
      this.ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2);
      this.ctx.closePath();
      this.ctx.fill();

      const dotX = calculateDotPosition(x, width, radius, time, phase, useConstantSpeed, settings.animationSpeed);
      const dotY = y + radius;

      this.ctx.fillStyle = bgColor;
      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.beginPath();
      this.ctx.arc(x + radius, y + radius, radius, Math.PI / 2, Math.PI * 1.5);
      this.ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2);
      this.ctx.closePath();
      this.ctx.stroke();

      const dotX = calculateDotPosition(x, width, radius, time, phase, useConstantSpeed, settings.animationSpeed);
      const dotY = y + radius;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }
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
      canvas: offscreen
    };
  }

  drawOffscreen(offscreenData, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.ctx.drawImage(
      offscreenData.canvas,
      sx, sy, sWidth, sHeight,
      dx, dy, dWidth, dHeight
    );
  }

  getTarget() {
    return this.ctx.canvas;
  }
}
