import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { calculateWeight } from '../weight.js';
import { getGlyphs } from '../../export/font-loader.js';

export function renderLinesTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const glyphs = getGlyphs(text);

  const testSize = 1000;

  // Find max width across all lines
  let maxTextWidth = 0;
  for (let i = 0; i < settings.numLines; i++) {
    const width = getLineWidth(renderer, glyphs, testSize, i, settings.time);
    maxTextWidth = Math.max(maxTextWidth, width);
  }

  const maxTextHeight = testSize + (settings.numLines - 1) * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  // Calculate scaling
  const scaleFactor = Math.min(usableWidth / maxTextWidth, usableHeight / maxTextHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;
  const textBlockHeight = finalFontSize + (settings.numLines - 1) * lineSpacing;
  const topY = (settings.canvasSize - textBlockHeight) / 2;
  const startY = topY + (settings.numLines - 1) * lineSpacing;

  const midIndex = (glyphs.length - 1) / 2;

  for (let lineIndex = 0; lineIndex < settings.numLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;

    // Center each line
    const lineWidth = getLineWidth(renderer, glyphs, finalFontSize, lineIndex, settings.time);
    let x = (settings.canvasSize - lineWidth) / 2;

    const startWeight =
      settings.maxWeight -
      ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;
    const endWeight =
      settings.minWeight +
      ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;

    for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex++) {
      const glyph = glyphs[glyphIndex];
      const weight = calculateWeight(
        glyphIndex,
        lineIndex,
        startWeight,
        endWeight,
        midIndex,
        glyphs.length,
        settings.time
      );

      const color = getColor(glyphIndex, lineIndex, settings.time, glyphs.length);
      renderer.drawGlyph(glyph, x, y, finalFontSize, weight, color, { baseline: 'top' });

      const glyphWidth = renderer.measureGlyph(glyph, finalFontSize, weight);
      x += glyphWidth;
    }
  }
}

function getLineWidth(renderer, glyphs, size, lineIndex, timeOffset = 0) {
  let total = 0;
  const midIndex = (glyphs.length - 1) / 2;
  const startWeight =
    settings.maxWeight -
    ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;
  const endWeight =
    settings.minWeight +
    ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;

  for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex++) {
    const weight = calculateWeight(
      glyphIndex,
      lineIndex,
      startWeight,
      endWeight,
      midIndex,
      glyphs.length,
      timeOffset
    );

    total += renderer.measureGlyph(glyphs[glyphIndex], size, weight);
  }
  return total;
}
