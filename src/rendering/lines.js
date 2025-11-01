import { settings } from '../config/settings.js';
import { getBackgroundColor, getColor } from './colors.js';
import { getLineWidth, calculateWeight } from './weight.js';
import { getContext } from './canvas.js';

// Render lines theme (exact port from DrawBot)
export function renderLinesTheme(canvas) {
  const ctx = getContext();

  // Clear canvas with appropriate background color
  ctx.fillStyle = getBackgroundColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const text = settings.text;
  if (!text) return;

  const testSize = 1000;

  // Find max width across all lines
  let maxTextWidth = 0;
  for (let i = 0; i < settings.numLines; i++) {
    const width = getLineWidth(text, testSize, i, settings.time);
    maxTextWidth = Math.max(maxTextWidth, width);
  }

  const maxTextHeight = settings.numLines * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  // Calculate scaling
  const scaleFactor = Math.min(usableWidth / maxTextWidth, usableHeight / maxTextHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;

  const textBlockHeight = settings.numLines * lineSpacing;
  const startY =
    (settings.canvasSize + textBlockHeight) / 2 - lineSpacing + settings.verticalOffset;

  const midIndex = (text.length - 1) / 2;

  // Draw text
  ctx.textBaseline = 'top';

  for (let lineIndex = 0; lineIndex < settings.numLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;

    // Center each line
    const lineWidth = getLineWidth(text, finalFontSize, lineIndex, settings.time);
    let x = (settings.canvasSize - lineWidth) / 2;

    const startWeight =
      settings.maxWeight -
      ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;
    const endWeight =
      settings.minWeight +
      ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;

    for (let charIndex = 0; charIndex < text.length; charIndex++) {
      const char = text[charIndex];
      let weight = calculateWeight(
        charIndex,
        lineIndex,
        startWeight,
        endWeight,
        midIndex,
        text.length,
        settings.time
      );

      // Set font with variable weight directly in font string
      ctx.font = `${weight} ${finalFontSize}px Kario39C3`;

      // Draw normal character
      ctx.fillStyle = getColor(charIndex, lineIndex, text.length, settings.time);
      ctx.fillText(char, x, y);

      const metrics = ctx.measureText(char);
      x += metrics.width;
    }
  }
}
