export class Renderer {
  drawBackground(width, height, color) {
    throw new Error('Method drawBackground() must be implemented');
  }

  measureText(text, fontSize, weight) {
    throw new Error('Method measureText() must be implemented');
  }

  drawText(text, x, y, fontSize, weight, color, options = {}) {
    throw new Error('Method drawText() must be implemented');
  }

  drawRect(x, y, width, height, fillColor) {
    throw new Error('Method drawRect() must be implemented');
  }

  drawCircle(cx, cy, r, fillColor = null, strokeColor = null, strokeWidth = 1) {
    throw new Error('Method drawCircle() must be implemented');
  }

  beginPath() {
    throw new Error('Method beginPath() must be implemented');
  }

  arc(x, y, radius, startAngle, endAngle) {
    throw new Error('Method arc() must be implemented');
  }

  closePath() {
    throw new Error('Method closePath() must be implemented');
  }

  fill(color) {
    throw new Error('Method fill() must be implemented');
  }

  stroke(color, width) {
    throw new Error('Method stroke() must be implemented');
  }

  drawPath(pathData, color) {
    throw new Error('Method drawPath() must be implemented');
  }

  save() {
    throw new Error('Method save() must be implemented');
  }

  restore() {
    throw new Error('Method restore() must be implemented');
  }

  translate(x, y) {
    throw new Error('Method translate() must be implemented');
  }

  scale(x, y) {
    throw new Error('Method scale() must be implemented');
  }

  createOffscreen(width, height) {
    throw new Error('Method createOffscreen() must be implemented');
  }

  drawOffscreen(offscreenRenderer, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    throw new Error('Method drawOffscreen() must be implemented');
  }

  getTarget() {
    throw new Error('Method getTarget() must be implemented');
  }
}
