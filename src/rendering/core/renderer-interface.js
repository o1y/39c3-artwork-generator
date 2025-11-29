/**
 * Abstract Renderer Interface
 *
 * This interface defines the contract for both Canvas and SVG renderers,
 * allowing theme rendering code to be shared between both output formats.
 */

export class Renderer {
  /**
   * Clear/fill the entire canvas with background color
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {string} color - Background color
   */
  clearCanvas(width, height, color) {
    throw new Error('Method clearCanvas() must be implemented');
  }

  /**
   * Measure text width at given font size and weight
   * @param {string} text - Text to measure
   * @param {number} fontSize - Font size in pixels
   * @param {number} weight - Font weight (10-100)
   * @returns {number} Width in pixels
   */
  measureText(text, fontSize, weight) {
    throw new Error('Method measureText() must be implemented');
  }

  /**
   * Draw text at specified position
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} fontSize - Font size in pixels
   * @param {number} weight - Font weight (10-100)
   * @param {string} color - Fill color
   * @param {object} options - Additional options (baseline, align, transform, etc.)
   */
  drawText(text, x, y, fontSize, weight, color, options = {}) {
    throw new Error('Method drawText() must be implemented');
  }

  /**
   * Draw a rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} fillColor - Fill color
   */
  drawRect(x, y, width, height, fillColor) {
    throw new Error('Method drawRect() must be implemented');
  }

  /**
   * Draw a circle
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} r - Radius
   * @param {string} fillColor - Fill color (null for no fill)
   * @param {string} strokeColor - Stroke color (null for no stroke)
   * @param {number} strokeWidth - Stroke width
   */
  drawCircle(cx, cy, r, fillColor = null, strokeColor = null, strokeWidth = 1) {
    throw new Error('Method drawCircle() must be implemented');
  }

  /**
   * Begin a path for custom shapes
   */
  beginPath() {
    throw new Error('Method beginPath() must be implemented');
  }

  /**
   * Draw an arc (part of a circle)
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Radius
   * @param {number} startAngle - Start angle in radians
   * @param {number} endAngle - End angle in radians
   */
  arc(x, y, radius, startAngle, endAngle) {
    throw new Error('Method arc() must be implemented');
  }

  /**
   * Close current path
   */
  closePath() {
    throw new Error('Method closePath() must be implemented');
  }

  /**
   * Fill current path
   * @param {string} color - Fill color
   */
  fill(color) {
    throw new Error('Method fill() must be implemented');
  }

  /**
   * Stroke current path
   * @param {string} color - Stroke color
   * @param {number} width - Stroke width
   */
  stroke(color, width) {
    throw new Error('Method stroke() must be implemented');
  }

  /**
   * Draw a custom pill/toggle shape
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} fontSize - Font size (used to calculate pill dimensions)
   * @param {string} color - Color
   * @param {number} time - Animation time
   * @param {number} phase - Animation phase offset
   * @param {boolean} useConstantSpeed - Whether to use constant animation speed
   * @param {string} pillStyle - 'outlined' or 'filled'
   * @param {string} bgColor - Background color (for filled style hollow dot)
   */
  drawTogglePill(x, y, fontSize, color, time, phase, useConstantSpeed, pillStyle, bgColor) {
    throw new Error('Method drawTogglePill() must be implemented');
  }

  /**
   * Save rendering state
   */
  save() {
    throw new Error('Method save() must be implemented');
  }

  /**
   * Restore rendering state
   */
  restore() {
    throw new Error('Method restore() must be implemented');
  }

  /**
   * Apply translation transform
   * @param {number} x - X offset
   * @param {number} y - Y offset
   */
  translate(x, y) {
    throw new Error('Method translate() must be implemented');
  }

  /**
   * Apply scale transform
   * @param {number} x - X scale factor
   * @param {number} y - Y scale factor
   */
  scale(x, y) {
    throw new Error('Method scale() must be implemented');
  }

  /**
   * Create an offscreen renderer (for Chrome glyph cache workaround)
   * @param {number} width - Offscreen width
   * @param {number} height - Offscreen height
   * @returns {Renderer} New renderer instance
   */
  createOffscreen(width, height) {
    throw new Error('Method createOffscreen() must be implemented');
  }

  /**
   * Draw offscreen renderer to this renderer
   * @param {Renderer} offscreenRenderer - The offscreen renderer
   * @param {number} sx - Source x
   * @param {number} sy - Source y
   * @param {number} sWidth - Source width
   * @param {number} sHeight - Source height
   * @param {number} dx - Destination x
   * @param {number} dy - Destination y
   * @param {number} dWidth - Destination width
   * @param {number} dHeight - Destination height
   */
  drawOffscreen(offscreenRenderer, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    throw new Error('Method drawOffscreen() must be implemented');
  }

  /**
   * Get the underlying render target (canvas element or SVG element)
   * @returns {HTMLCanvasElement|SVGElement}
   */
  getTarget() {
    throw new Error('Method getTarget() must be implemented');
  }
}
