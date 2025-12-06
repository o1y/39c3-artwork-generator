import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { calculateWeight } from '../weight.js';

export function renderLinesTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const testSize = 1000;

  // Find max width across all lines
  let maxTextWidth = 0;
  for (let i = 0; i < settings.numLines; i++) {
    const width = getLineWidth(renderer, text, testSize, i, settings.time);
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

  const midIndex = (text.length - 1) / 2;

  for (let lineIndex = 0; lineIndex < settings.numLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;

    // Center each line
    const lineWidth = getLineWidth(renderer, text, finalFontSize, lineIndex, settings.time);
    let x = (settings.canvasSize - lineWidth) / 2;

    const startWeight =
      settings.maxWeight -
      ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;
    const endWeight =
      settings.minWeight +
      ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;

    for (let charIndex = 0; charIndex < text.length; charIndex++) {
      const char = text[charIndex];
      const weight = calculateWeight(
        charIndex,
        lineIndex,
        startWeight,
        endWeight,
        midIndex,
        text.length,
        settings.time
      );

      const color = getColor(charIndex, lineIndex, text.length, settings.time);
      renderer.drawText(char, x, y, finalFontSize, weight, color, { baseline: 'top' });

      const charWidth = renderer.measureText(char, finalFontSize, weight);
      x += charWidth;
    }
  }
}

// Helper function to measure line width
function getLineWidth(renderer, text, size, lineIndex, timeOffset = 0) {
  let total = 0;
  const midIndex = (text.length - 1) / 2;
  const startWeight =
    settings.maxWeight -
    ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;
  const endWeight =
    settings.minWeight +
    ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const weight = calculateWeight(
      charIndex,
      lineIndex,
      startWeight,
      endWeight,
      midIndex,
      text.length,
      timeOffset
    );

    total += renderer.measureText(text[charIndex], size, weight);
  }
  return total;
}
