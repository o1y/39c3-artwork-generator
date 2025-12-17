import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { calculateWeight } from '../weight.js';
import { getGlyphs } from '../../export/font-loader.js';

function getLineWeightRange(lineIndex) {
  const weightRange = (settings.maxWeight - settings.minWeight) / (settings.numLines - 1);
  return {
    startWeight: settings.maxWeight - weightRange * lineIndex,
    endWeight: settings.minWeight + weightRange * lineIndex,
  };
}

export function renderLinesTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const glyphs = getGlyphs(text);
  const numLines = settings.numLines;
  const testSize = 1000;

  let maxTextWidth = 0;
  for (let i = 0; i < numLines; i++) {
    const width = getLineWidth(renderer, glyphs, testSize, i);
    maxTextWidth = Math.max(maxTextWidth, width);
  }

  const maxTextHeight = testSize + (numLines - 1) * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  const scaleFactor = Math.min(usableWidth / maxTextWidth, usableHeight / maxTextHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;
  const textBlockHeight = finalFontSize + (numLines - 1) * lineSpacing;
  const topY = (settings.canvasSize - textBlockHeight) / 2;
  const startY = topY + (numLines - 1) * lineSpacing;

  const midIndex = (glyphs.length - 1) / 2;

  for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;

    const lineWidth = getLineWidth(renderer, glyphs, finalFontSize, lineIndex);
    let x = (settings.canvasSize - lineWidth) / 2;

    const { startWeight, endWeight } = getLineWeightRange(lineIndex);

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

      x += renderer.measureGlyph(glyph, finalFontSize, weight);
    }
  }
}

function getLineWidth(renderer, glyphs, size, lineIndex) {
  const midIndex = (glyphs.length - 1) / 2;
  const { startWeight, endWeight } = getLineWeightRange(lineIndex);

  let total = 0;
  for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex++) {
    const weight = calculateWeight(
      glyphIndex,
      lineIndex,
      startWeight,
      endWeight,
      midIndex,
      glyphs.length,
      settings.time
    );
    total += renderer.measureGlyph(glyphs[glyphIndex], size, weight);
  }
  return total;
}
