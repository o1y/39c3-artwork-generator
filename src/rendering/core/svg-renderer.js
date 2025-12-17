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
 * @typedef {import('../../types.js').SVGTransform} SVGTransform
 * @typedef {import('../../types.js').OffscreenSVGData} OffscreenSVGData
 */

/**
 * SVG rendering engine implementation.
 * Renders graphics by creating SVG DOM elements.
 * @extends Renderer
 */
export class SVGRenderer extends Renderer {
  /**
   * Create a new SVGRenderer
   * @param {SVGSVGElement | SVGGElement} svgElement - Root SVG or group element to render into
   */
  constructor(svgElement) {
    super();
    /** @type {SVGSVGElement | SVGGElement} */
    this.svg = svgElement;
    /** @type {string} */
    this.currentPathData = '';
    /** @type {SVGTransform | null} */
    this.transform = null;
    /** @type {SVGTransform[]} */
    this.transformStack = [];
    /** @type {number | undefined} */
    this.offscreenWidth = undefined;
    /** @type {number | undefined} */
    this.offscreenHeight = undefined;
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {string} color
   */
  drawBackground(width, height, color) {
    const rect = this.createSVGElement('rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('fill', color);
    this.svg.appendChild(rect);
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

    let transform = '';
    if (this.transform) {
      const transformParts = [];
      transformParts.push(`translate(${this.transform.translateX}, ${this.transform.translateY})`);
      transformParts.push(`scale(${this.transform.scaleX}, ${this.transform.scaleY})`);
      transform = transformParts.join(' ');
    }

    const path = this.createSVGElement('path');
    path.setAttribute('d', result.pathData);
    path.setAttribute('fill', color);
    path.setAttribute('fill-rule', 'nonzero');
    if (transform) {
      path.setAttribute('transform', transform);
    }

    this.svg.appendChild(path);
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

    let transform = '';
    if (this.transform) {
      const transformParts = [];
      transformParts.push(`translate(${this.transform.translateX}, ${this.transform.translateY})`);
      transformParts.push(`scale(${this.transform.scaleX}, ${this.transform.scaleY})`);
      transform = transformParts.join(' ');
    }

    const path = this.createSVGElement('path');
    path.setAttribute('d', result.pathData);
    path.setAttribute('fill', color);
    path.setAttribute('fill-rule', 'nonzero');
    if (transform) {
      path.setAttribute('transform', transform);
    }

    this.svg.appendChild(path);
  }

  /**
   * @param {string} pathData
   * @param {string} color
   */
  drawPath(pathData, color) {
    let transform = '';
    if (this.transform) {
      const transformParts = [];
      transformParts.push(`translate(${this.transform.translateX}, ${this.transform.translateY})`);
      transformParts.push(`scale(${this.transform.scaleX}, ${this.transform.scaleY})`);
      transform = transformParts.join(' ');
    }

    const path = this.createSVGElement('path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', color);
    path.setAttribute('fill-rule', 'nonzero');
    if (transform) {
      path.setAttribute('transform', transform);
    }

    this.svg.appendChild(path);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} fillColor
   */
  drawRect(x, y, width, height, fillColor) {
    const rect = this.createSVGElement('rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('fill', fillColor);
    this.svg.appendChild(rect);
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
    const circle = this.createSVGElement('circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(r));

    if (fillColor) {
      circle.setAttribute('fill', fillColor);
    } else {
      circle.setAttribute('fill', 'none');
    }

    if (strokeColor) {
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', String(strokeWidth));
    }

    this.svg.appendChild(circle);
  }

  beginPath() {
    this.currentPathData = '';
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} startAngle
   * @param {number} endAngle
   */
  arc(x, y, radius, startAngle, endAngle) {
    const startX = x + radius * Math.cos(startAngle);
    const startY = y + radius * Math.sin(startAngle);
    const endX = x + radius * Math.cos(endAngle);
    const endY = y + radius * Math.sin(endAngle);

    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    const sweep = endAngle > startAngle ? 1 : 0;

    if (!this.currentPathData) {
      this.currentPathData = `M ${startX} ${startY} `;
    }

    this.currentPathData += `A ${radius} ${radius} 0 ${largeArc} ${sweep} ${endX} ${endY} `;
  }

  closePath() {
    this.currentPathData += 'Z';
  }

  /**
   * @param {string} color
   */
  fill(color) {
    const path = this.createSVGElement('path');
    path.setAttribute('d', this.currentPathData.trim());
    path.setAttribute('fill', color);
    this.svg.appendChild(path);
    this.currentPathData = '';
  }

  /**
   * @param {string} color
   * @param {number} width
   */
  stroke(color, width) {
    const path = this.createSVGElement('path');
    path.setAttribute('d', this.currentPathData.trim());
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', String(width));
    this.svg.appendChild(path);
    this.currentPathData = '';
  }

  /**
   * Ensure transform object is initialized
   * @private
   */
  ensureTransform() {
    if (!this.transform) {
      this.transform = { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 };
    }
  }

  save() {
    if (!this.transformStack) {
      this.transformStack = [];
    }
    const currentTransform = this.transform
      ? { ...this.transform }
      : { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 };
    this.transformStack.push(currentTransform);

    this.ensureTransform();
  }

  restore() {
    if (this.transformStack && this.transformStack.length > 0) {
      this.transform = this.transformStack.pop() || null;
    } else {
      this.transform = null;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  translate(x, y) {
    this.ensureTransform();
    if (this.transform) {
      this.transform.translateX += x;
      this.transform.translateY += y;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  scale(x, y) {
    this.ensureTransform();
    if (this.transform) {
      this.transform.scaleX *= x;
      this.transform.scaleY *= y;
    }
  }

  /**
   * @param {number} width
   * @param {number} height
   * @returns {OffscreenSVGData}
   */
  createOffscreen(width, height) {
    const group = /** @type {SVGGElement} */ (this.createSVGElement('g'));
    const offscreenRenderer = new SVGRenderer(group);
    offscreenRenderer.offscreenWidth = width;
    offscreenRenderer.offscreenHeight = height;

    return {
      renderer: offscreenRenderer,
      group: group,
    };
  }

  /**
   * @param {OffscreenSVGData} offscreenData
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
    const scaleX = dWidth / sWidth;
    const scaleY = dHeight / sHeight;

    const transform = `translate(${dx}, ${dy}) scale(${scaleX}, ${scaleY})`;
    offscreenData.group.setAttribute('transform', transform);

    this.svg.appendChild(offscreenData.group);
  }

  /**
   * @returns {SVGSVGElement | SVGGElement}
   */
  getTarget() {
    return this.svg;
  }

  /**
   * Create an SVG element with the correct namespace
   * @param {string} tagName - SVG element tag name
   * @returns {SVGElement}
   * @private
   */
  createSVGElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}
