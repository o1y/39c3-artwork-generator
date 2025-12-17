import { Renderer } from './renderer-interface.js';
import {
  textToPath,
  getTextWidth,
  getMiddleBaselineOffset,
  getAscenderHeight,
  glyphToPath,
  getGlyphWidth,
} from '../../export/font-loader.js';

/**
 * @typedef {import('../../types.js').DrawOptions} DrawOptions
 * @typedef {import('../../types.js').Glyph} Glyph
 * @typedef {import('../../types.js').OffscreenCanvasData} OffscreenCanvasData
 */

/**
 * Canvas 2D rendering engine implementation.
 * Renders graphics using the HTML Canvas 2D API.
 * @extends Renderer
 */
export class CanvasRenderer extends Renderer {
  /**
   * Create a new CanvasRenderer
   * @param {CanvasRenderingContext2D} ctx - 2D canvas rendering context
   */
  constructor(ctx) {
    super();
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {string} color
   */
  drawBackground(width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * @param {string} text
   * @param {number} fontSize
   * @param {number} weight
   * @param {number} [width]
   * @returns {number}
   */
  measureText(text, fontSize, weight, width) {
    return getTextWidth(text, fontSize, weight, width);
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} fontSize
   * @param {number} weight
   * @param {string} color
   * @param {DrawOptions} [options={}]
   */
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

  /**
   * Measure the width of a single glyph
   * @param {Glyph} glyph - Glyph object from opentype.js
   * @param {number} fontSize - Font size in pixels
   * @param {number} weight - Font weight axis value
   * @param {number} [width] - Optional fixed width
   * @returns {number} Glyph width in pixels
   */
  measureGlyph(glyph, fontSize, weight, width) {
    return getGlyphWidth(glyph, fontSize, weight, width);
  }

  /**
   * Draw a single glyph at the specified position
   * @param {Glyph} glyph - Glyph object from opentype.js
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} fontSize - Font size in pixels
   * @param {number} weight - Font weight axis value
   * @param {string} color - CSS color string
   * @param {DrawOptions} [options={}] - Drawing options
   */
  drawGlyph(glyph, x, y, fontSize, weight, color, options = {}) {
    let adjustedY = y;

    if (options.baseline === 'middle') {
      const offset = getMiddleBaselineOffset(fontSize);
      adjustedY = y + offset;
    } else if (options.baseline === 'top') {
      const ascender = getAscenderHeight(fontSize);
      adjustedY = y + ascender;
    }

    const width = options.width;
    const result = glyphToPath(glyph, x, adjustedY, fontSize, weight, width);

    this.ctx.fillStyle = color;
    this.ctx.fill(new Path2D(result.pathData));
  }

  /**
   * @param {string} pathData
   * @param {string} color
   */
  drawPath(pathData, color) {
    this.ctx.fillStyle = color;
    this.ctx.fill(new Path2D(pathData));
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} fillColor
   */
  drawRect(x, y, width, height, fillColor) {
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   * @param {string | null} [fillColor=null]
   * @param {string | null} [strokeColor=null]
   * @param {number} [strokeWidth=1]
   */
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

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} startAngle
   * @param {number} endAngle
   */
  arc(x, y, radius, startAngle, endAngle) {
    this.ctx.arc(x, y, radius, startAngle, endAngle);
  }

  closePath() {
    this.ctx.closePath();
  }

  /**
   * @param {string} color
   */
  fill(color) {
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * @param {string} color
   * @param {number} width
   */
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

  /**
   * @param {number} x
   * @param {number} y
   */
  translate(x, y) {
    this.ctx.translate(x, y);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  scale(x, y) {
    this.ctx.scale(x, y);
  }

  /**
   * @param {number} width
   * @param {number} height
   * @returns {OffscreenCanvasData}
   */
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

  /**
   * @param {OffscreenCanvasData} offscreenData
   * @param {number} sx
   * @param {number} sy
   * @param {number} sWidth
   * @param {number} sHeight
   * @param {number} dx
   * @param {number} dy
   * @param {number} dWidth
   * @param {number} dHeight
   */
  drawOffscreen(offscreenData, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.ctx.drawImage(offscreenData.canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  /**
   * @returns {HTMLCanvasElement}
   */
  getTarget() {
    return this.ctx.canvas;
  }
}
