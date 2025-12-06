export class Renderer {
  drawBackground(_width, _height, _color) {
    throw new Error('Method drawBackground() must be implemented');
  }

  measureText(_text, _fontSize, _weight) {
    throw new Error('Method measureText() must be implemented');
  }

  drawText(_text, _x, _y, _fontSize, _weight, _color, _options = {}) {
    throw new Error('Method drawText() must be implemented');
  }

  drawRect(_x, _y, _width, _height, _fillColor) {
    throw new Error('Method drawRect() must be implemented');
  }

  drawCircle(_cx, _cy, _r, _fillColor = null, _strokeColor = null, _strokeWidth = 1) {
    throw new Error('Method drawCircle() must be implemented');
  }

  beginPath() {
    throw new Error('Method beginPath() must be implemented');
  }

  arc(_x, _y, _radius, _startAngle, _endAngle) {
    throw new Error('Method arc() must be implemented');
  }

  closePath() {
    throw new Error('Method closePath() must be implemented');
  }

  fill(_color) {
    throw new Error('Method fill() must be implemented');
  }

  stroke(_color, _width) {
    throw new Error('Method stroke() must be implemented');
  }

  drawPath(_pathData, _color) {
    throw new Error('Method drawPath() must be implemented');
  }

  save() {
    throw new Error('Method save() must be implemented');
  }

  restore() {
    throw new Error('Method restore() must be implemented');
  }

  translate(_x, _y) {
    throw new Error('Method translate() must be implemented');
  }

  scale(_x, _y) {
    throw new Error('Method scale() must be implemented');
  }

  createOffscreen(_width, _height) {
    throw new Error('Method createOffscreen() must be implemented');
  }

  drawOffscreen(_offscreenRenderer, _sx, _sy, _sWidth, _sHeight, _dx, _dy, _dWidth, _dHeight) {
    throw new Error('Method drawOffscreen() must be implemented');
  }

  getTarget() {
    throw new Error('Method getTarget() must be implemented');
  }
}
