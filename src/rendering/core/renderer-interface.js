/**
 * @typedef {import('../../types.js').DrawOptions} DrawOptions
 * @typedef {import('../../types.js').Glyph} Glyph
 */

/**
 * Abstract base class for rendering engines.
 * Provides a common interface for drawing to different targets (Canvas, SVG).
 * @abstract
 */
export class Renderer {
  /**
   * Fill the background with a solid color
   * @param {number} _width - Canvas width in pixels
   * @param {number} _height - Canvas height in pixels
   * @param {string} _color - CSS color string
   * @returns {void}
   * @abstract
   */
  drawBackground(_width, _height, _color) {
    throw new Error('Method drawBackground() must be implemented');
  }

  /**
   * Measure the width of text when rendered
   * @param {string} _text - Text to measure
   * @param {number} _fontSize - Font size in pixels
   * @param {number} _weight - Font weight axis value (10-100)
   * @returns {number} Width of rendered text in pixels
   * @abstract
   */
  measureText(_text, _fontSize, _weight) {
    throw new Error('Method measureText() must be implemented');
  }

  /**
   * Draw text at the specified position
   * @param {string} _text - Text to draw
   * @param {number} _x - X coordinate
   * @param {number} _y - Y coordinate
   * @param {number} _fontSize - Font size in pixels
   * @param {number} _weight - Font weight axis value (10-100)
   * @param {string} _color - CSS color string
   * @param {DrawOptions} [_options={}] - Drawing options
   * @returns {void}
   * @abstract
   */
  drawText(_text, _x, _y, _fontSize, _weight, _color, _options = {}) {
    throw new Error('Method drawText() must be implemented');
  }

  /**
   * Draw a filled rectangle
   * @param {number} _x - X coordinate of top-left corner
   * @param {number} _y - Y coordinate of top-left corner
   * @param {number} _width - Rectangle width
   * @param {number} _height - Rectangle height
   * @param {string} _fillColor - CSS fill color
   * @returns {void}
   * @abstract
   */
  drawRect(_x, _y, _width, _height, _fillColor) {
    throw new Error('Method drawRect() must be implemented');
  }

  /**
   * Draw a circle with optional fill and stroke
   * @param {number} _cx - Center X coordinate
   * @param {number} _cy - Center Y coordinate
   * @param {number} _r - Radius
   * @param {string | null} [_fillColor=null] - CSS fill color (null for no fill)
   * @param {string | null} [_strokeColor=null] - CSS stroke color (null for no stroke)
   * @param {number} [_strokeWidth=1] - Stroke width in pixels
   * @returns {void}
   * @abstract
   */
  drawCircle(_cx, _cy, _r, _fillColor = null, _strokeColor = null, _strokeWidth = 1) {
    throw new Error('Method drawCircle() must be implemented');
  }

  /**
   * Begin a new path for manual path construction
   * @returns {void}
   * @abstract
   */
  beginPath() {
    throw new Error('Method beginPath() must be implemented');
  }

  /**
   * Add an arc to the current path
   * @param {number} _x - Center X coordinate
   * @param {number} _y - Center Y coordinate
   * @param {number} _radius - Arc radius
   * @param {number} _startAngle - Start angle in radians
   * @param {number} _endAngle - End angle in radians
   * @returns {void}
   * @abstract
   */
  arc(_x, _y, _radius, _startAngle, _endAngle) {
    throw new Error('Method arc() must be implemented');
  }

  /**
   * Close the current path
   * @returns {void}
   * @abstract
   */
  closePath() {
    throw new Error('Method closePath() must be implemented');
  }

  /**
   * Fill the current path with a color
   * @param {string} _color - CSS fill color
   * @returns {void}
   * @abstract
   */
  fill(_color) {
    throw new Error('Method fill() must be implemented');
  }

  /**
   * Stroke the current path with a color and width
   * @param {string} _color - CSS stroke color
   * @param {number} _width - Stroke width in pixels
   * @returns {void}
   * @abstract
   */
  stroke(_color, _width) {
    throw new Error('Method stroke() must be implemented');
  }

  /**
   * Draw an SVG path string
   * @param {string} _pathData - SVG path data (d attribute)
   * @param {string} _color - CSS fill color
   * @returns {void}
   * @abstract
   */
  drawPath(_pathData, _color) {
    throw new Error('Method drawPath() must be implemented');
  }

  /**
   * Save the current transform state
   * @returns {void}
   * @abstract
   */
  save() {
    throw new Error('Method save() must be implemented');
  }

  /**
   * Restore the previously saved transform state
   * @returns {void}
   * @abstract
   */
  restore() {
    throw new Error('Method restore() must be implemented');
  }

  /**
   * Apply a translation transform
   * @param {number} _x - X translation
   * @param {number} _y - Y translation
   * @returns {void}
   * @abstract
   */
  translate(_x, _y) {
    throw new Error('Method translate() must be implemented');
  }

  /**
   * Apply a scale transform
   * @param {number} _x - X scale factor
   * @param {number} _y - Y scale factor
   * @returns {void}
   * @abstract
   */
  scale(_x, _y) {
    throw new Error('Method scale() must be implemented');
  }

  /**
   * Create an offscreen rendering target for buffered drawing
   * @param {number} _width - Offscreen width
   * @param {number} _height - Offscreen height
   * @returns {import('../../types.js').OffscreenCanvasData | import('../../types.js').OffscreenSVGData}
   * @abstract
   */
  createOffscreen(_width, _height) {
    throw new Error('Method createOffscreen() must be implemented');
  }

  /**
   * Draw an offscreen buffer to the main target with source/destination rectangles
   * @param {import('../../types.js').OffscreenCanvasData | import('../../types.js').OffscreenSVGData} _offscreenData - Offscreen data from createOffscreen()
   * @param {number} _sx - Source X coordinate
   * @param {number} _sy - Source Y coordinate
   * @param {number} _sWidth - Source width
   * @param {number} _sHeight - Source height
   * @param {number} _dx - Destination X coordinate
   * @param {number} _dy - Destination Y coordinate
   * @param {number} _dWidth - Destination width
   * @param {number} _dHeight - Destination height
   * @returns {void}
   * @abstract
   */
  drawOffscreen(_offscreenData, _sx, _sy, _sWidth, _sHeight, _dx, _dy, _dWidth, _dHeight) {
    throw new Error('Method drawOffscreen() must be implemented');
  }

  /**
   * Get the underlying rendering target (canvas or SVG element)
   * @returns {HTMLCanvasElement | SVGSVGElement | SVGGElement}
   * @abstract
   */
  getTarget() {
    throw new Error('Method getTarget() must be implemented');
  }
}
