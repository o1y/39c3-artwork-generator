import { settings, parseToggleVariant } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { PILL_HEIGHT_RATIO, PILL_WIDTH_RATIO } from '../utils/pill-utils.js';
import { getNormalizedTime } from '../../animation/timing.js';

/**
 * Render Toggle Theme
 * Works with any renderer (Canvas or SVG)
 */
export function renderToggleTheme(renderer, canvasSize) {
  renderer.clearCanvas(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const { position, style } = parseToggleVariant(settings.toggleVariant);
  const textColor = getColor(0, 0, text.length, settings.time);

  let textSize = 200;

  // Measure text width at initial size (account for per-character weight animation)
  let textWidth = measureTextWithAnimation(renderer, text, textSize);
  let toggleHeight = textSize * PILL_HEIGHT_RATIO;
  let toggleWidth = toggleHeight * PILL_WIDTH_RATIO;
  const spacing = textSize * 0.12;
  let totalContentWidth = toggleWidth + spacing + textWidth;

  // Check if content fits, if not scale down
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  if (totalContentWidth > usableWidth) {
    const scaleFactorInitial = usableWidth / totalContentWidth;
    textSize *= scaleFactorInitial;
    toggleHeight = textSize * PILL_HEIGHT_RATIO;
    toggleWidth = toggleHeight * PILL_WIDTH_RATIO;
    textWidth = measureTextWithAnimation(renderer, text, textSize);
    totalContentWidth = toggleWidth + textSize * 0.2 + textWidth;
  }

  // Center horizontally and vertically
  const startX = (settings.canvasSize - totalContentWidth) / 2;
  const centerY = settings.canvasSize / 2;
  const bgColor = getBackgroundColor();

  // Position toggle and text based on variant
  let toggleX, textX;
  if (position === 'left') {
    // Draw toggle on the left, text on the right
    toggleX = startX;
    textX = startX + toggleWidth + spacing;
  } else {
    // Draw text on the left, toggle on the right
    textX = startX;
    toggleX = startX + textWidth + spacing;
  }

  const toggleY = centerY - (textSize * PILL_HEIGHT_RATIO) / 2;
  renderer.drawTogglePill(
    toggleX,
    toggleY,
    textSize,
    textColor,
    settings.time,
    0,
    true,
    style,
    bgColor
  );

  // Render each character with individual weight animation
  let currentTextX = textX;
  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];

    // Each character cycles through full weight range (min to max)
    const t = getNormalizedTime(settings.time);
    const phase = charIndex * 0.3;
    const cycle = (Math.sin(t + phase) + 1) / 2;
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    const color = getColor(charIndex, 0, text.length, settings.time);

    renderer.drawText(char, currentTextX, centerY, textSize, weight, color, { baseline: 'middle' });

    // Move to next character position
    const charWidth = renderer.measureText(char, textSize, weight);
    currentTextX += charWidth;
  }
}

function measureTextWithAnimation(renderer, text, size) {
  let textWidth = 0;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const t = getNormalizedTime(settings.time);
    const phase = charIndex * 0.3;
    const cycle = (Math.sin(t + phase) + 1) / 2;
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    textWidth += renderer.measureText(text[charIndex], size, weight);
  }

  return textWidth;
}
