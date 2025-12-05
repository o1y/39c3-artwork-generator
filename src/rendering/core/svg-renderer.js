import { Renderer } from './renderer-interface.js';
import { settings } from '../../config/settings.js';
import { textToPath, getTextWidth, getMiddleBaselineOffset, getAscenderHeight } from '../../export/font-loader.js';
import { calculatePillDimensions, calculateDotPosition } from '../utils/pill-utils.js';

export class SVGRenderer extends Renderer {
  constructor(svgElement) {
    super();
    this.svg = svgElement;
    this.currentPathData = '';
  }

  clearCanvas(width, height, color) {
    const rect = this.createSVGElement('rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', color);
    const target = this.currentGroup || this.svg;
    target.appendChild(rect);
  }

  measureText(text, fontSize, weight) {
    return getTextWidth(text, fontSize, weight);
  }

  drawText(text, x, y, fontSize, weight, color, options = {}) {
    // Handle baseline alignment
    let adjustedY = y;

    if (options.baseline === 'middle') {
      const offset = getMiddleBaselineOffset(fontSize);
      // In screen coordinates (Y-down), to center text we need to move DOWN (add offset)
      adjustedY = y + offset;
    } else if (options.baseline === 'top') {
      const ascender = getAscenderHeight(fontSize);
      // For 'top' baseline, the top of the text should be at y
      // So we need to move the baseline DOWN by the ascender height
      adjustedY = y + ascender;
    }
    // If baseline is 'alphabetic' (default), use y as-is

    const result = textToPath(text, x, adjustedY, fontSize, weight);

    // Build transform string only for saved transforms
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

    // Append to current group if exists, otherwise to main svg
    const target = this.currentGroup || this.svg;
    target.appendChild(path);
  }

  drawRect(x, y, width, height, fillColor) {
    const rect = this.createSVGElement('rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', fillColor);
    const target = this.currentGroup || this.svg;
    target.appendChild(rect);
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

    const target = this.currentGroup || this.svg;
    target.appendChild(circle);
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
    const target = this.currentGroup || this.svg;
    target.appendChild(path);
    this.currentPathData = '';
  }

  stroke(color, width) {
    const path = this.createSVGElement('path');
    path.setAttribute('d', this.currentPathData.trim());
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', width);
    const target = this.currentGroup || this.svg;
    target.appendChild(path);
    this.currentPathData = '';
  }

  drawTogglePill(x, y, fontSize, color, time, phase, useConstantSpeed, pillStyle, bgColor) {
    const { height, width, radius, strokeWidth, dotRadius } = calculatePillDimensions(fontSize);

    const d = `
      M ${x + radius} ${y}
      L ${x + width - radius} ${y}
      A ${radius} ${radius} 0 0 1 ${x + width - radius} ${y + height}
      L ${x + radius} ${y + height}
      A ${radius} ${radius} 0 0 1 ${x + radius} ${y}
      Z
    `
      .replace(/\s+/g, ' ')
      .trim();

    const path = this.createSVGElement('path');
    path.setAttribute('d', d);

    if (pillStyle === 'filled') {
      path.setAttribute('fill', color);
    } else {
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', strokeWidth);
    }

    const target = this.currentGroup || this.svg;
    target.appendChild(path);

    const dotX = calculateDotPosition(
      x,
      width,
      radius,
      time,
      phase,
      useConstantSpeed,
      settings.animationSpeed
    );
    const dotY = y + radius;

    if (pillStyle === 'filled') {
      this.drawCircle(dotX, dotY, dotRadius, bgColor);
    } else {
      this.drawCircle(dotX, dotY, dotRadius, color);
    }
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

    const target = this.currentGroup || this.svg;
    target.appendChild(offscreenData.group);
  }

  getTarget() {
    return this.svg;
  }

  createSVGElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}
