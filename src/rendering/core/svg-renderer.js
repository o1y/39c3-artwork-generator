import { Renderer } from './renderer-interface.js';
import {
  textToPath,
  getTextWidth,
  getMiddleBaselineOffset,
  getAscenderHeight,
  glyphToPath,
  getGlyphWidth,
} from '../../export/font-loader.js';

export class SVGRenderer extends Renderer {
  constructor(svgElement) {
    super();
    this.svg = svgElement;
    this.currentPathData = '';
  }

  drawBackground(width, height, color) {
    const rect = this.createSVGElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', color);
    this.svg.appendChild(rect);
  }

  measureText(text, fontSize, weight, width) {
    return getTextWidth(text, fontSize, weight, width);
  }

  measureGlyph(glyph, fontSize, weight, width) {
    return getGlyphWidth(glyph, fontSize, weight, width);
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

  drawRect(x, y, width, height, fillColor) {
    const rect = this.createSVGElement('rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', fillColor);
    this.svg.appendChild(rect);
  }

  drawCircle(cx, cy, r, fillColor = null, strokeColor = null, strokeWidth = 1) {
    const circle = this.createSVGElement('circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);

    if (fillColor) {
      circle.setAttribute('fill', fillColor);
    } else {
      circle.setAttribute('fill', 'none');
    }

    if (strokeColor) {
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', strokeWidth);
    }

    this.svg.appendChild(circle);
  }

  beginPath() {
    this.currentPathData = '';
  }

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

  fill(color) {
    const path = this.createSVGElement('path');
    path.setAttribute('d', this.currentPathData.trim());
    path.setAttribute('fill', color);
    this.svg.appendChild(path);
    this.currentPathData = '';
  }

  stroke(color, width) {
    const path = this.createSVGElement('path');
    path.setAttribute('d', this.currentPathData.trim());
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', width);
    this.svg.appendChild(path);
    this.currentPathData = '';
  }

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
      this.transform = this.transformStack.pop();
    } else {
      this.transform = null;
    }
  }

  translate(x, y) {
    this.ensureTransform();
    this.transform.translateX += x;
    this.transform.translateY += y;
  }

  scale(x, y) {
    this.ensureTransform();
    this.transform.scaleX *= x;
    this.transform.scaleY *= y;
  }

  createOffscreen(width, height) {
    const group = this.createSVGElement('g');
    const offscreenRenderer = new SVGRenderer(group);
    offscreenRenderer.offscreenWidth = width;
    offscreenRenderer.offscreenHeight = height;

    return {
      renderer: offscreenRenderer,
      group: group,
    };
  }

  drawOffscreen(offscreenData, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    const scaleX = dWidth / sWidth;
    const scaleY = dHeight / sHeight;

    const transform = `translate(${dx}, ${dy}) scale(${scaleX}, ${scaleY})`;
    offscreenData.group.setAttribute('transform', transform);

    this.svg.appendChild(offscreenData.group);
  }

  getTarget() {
    return this.svg;
  }

  createSVGElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}
