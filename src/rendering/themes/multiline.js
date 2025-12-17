import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { calculateWeight } from '../weight.js';
import { getGlyphs } from '../../export/font-loader.js';

// Invert lineIndex since we draw top-to-bottom but lines theme draws bottom-to-top
function getLineWeightRange(lineIndex, numLines) {
  const invertedLineIndex = numLines - 1 - lineIndex;
  const weightRange = (settings.maxWeight - settings.minWeight) / Math.max(numLines - 1, 1);
  return {
    invertedLineIndex,
    startWeight: settings.maxWeight - weightRange * invertedLineIndex,
    endWeight: settings.minWeight + weightRange * invertedLineIndex,
  };
}

export function renderMultilineTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const lines = text.split('\n').filter((line) => line.length > 0);
  if (lines.length === 0) return;

  const lineGlyphs = lines.map((line) => getGlyphs(line));
  const numLines = lines.length;
  const testSize = 1000;

  let maxLineWidth = 0;
  for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
    const width = getLineWidth(renderer, lineGlyphs[lineIndex], testSize, lineIndex, numLines);
    maxLineWidth = Math.max(maxLineWidth, width);
  }

  const totalHeight = testSize + (numLines - 1) * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  const scaleFactor = Math.min(usableWidth / maxLineWidth, usableHeight / totalHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;

  const textBlockHeight = finalFontSize + (numLines - 1) * lineSpacing;
  const topY = (settings.canvasSize - textBlockHeight) / 2;

  for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
    const glyphs = lineGlyphs[lineIndex];
    const y = topY + lineIndex * lineSpacing;

    const lineWidth = getLineWidth(renderer, glyphs, finalFontSize, lineIndex, numLines);
    let x = (settings.canvasSize - lineWidth) / 2;

    const midIndex = (glyphs.length - 1) / 2;
    const { invertedLineIndex, startWeight, endWeight } = getLineWeightRange(lineIndex, numLines);

    for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex++) {
      const glyph = glyphs[glyphIndex];
      const weight = calculateWeight(
        glyphIndex,
        invertedLineIndex,
        startWeight,
        endWeight,
        midIndex,
        glyphs.length,
        settings.time
      );

      const color = getColor(glyphIndex, invertedLineIndex, settings.time, glyphs.length);
      renderer.drawGlyph(glyph, x, y, finalFontSize, weight, color, { baseline: 'top' });

      x += renderer.measureGlyph(glyph, finalFontSize, weight);
    }
  }
}

function getLineWidth(renderer, glyphs, size, lineIndex, numLines) {
  const midIndex = (glyphs.length - 1) / 2;
  const { invertedLineIndex, startWeight, endWeight } = getLineWeightRange(lineIndex, numLines);

  let total = 0;
  for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex++) {
    const weight = calculateWeight(
      glyphIndex,
      invertedLineIndex,
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
