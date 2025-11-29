import { settings, themePresets } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { PILL_HEIGHT_RATIO, PILL_WIDTH_RATIO } from '../utils/pill-utils.js';

/**
 * Render Toggle Theme
 * Works with any renderer (Canvas or SVG)
 */
export function renderToggleTheme(renderer, canvasSize) {
  renderer.clearCanvas(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const preset = themePresets[settings.theme];
  const pillStyle = preset && preset.pillStyle ? preset.pillStyle : 'outlined';
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
    totalContentWidth = toggleWidth + (textSize * 0.2) + textWidth;
  }

  // Center horizontally and vertically
  const startX = (settings.canvasSize - totalContentWidth) / 2;
  const centerY = settings.canvasSize / 2;

  // Draw toggle on the left, aligned to baseline (constant speed)
  const toggleX = startX;
  const toggleY = centerY - (textSize * PILL_HEIGHT_RATIO) / 2;
  const bgColor = getBackgroundColor();
  renderer.drawTogglePill(toggleX, toggleY, textSize, textColor, settings.time, 0, true, pillStyle, bgColor);

  // Draw text on the right, aligned to center - render each character individually
  let textX = startX + toggleWidth + spacing;

  // Apply width from slider (50-100 range)
  const baseWidth = 76;
  const scaleFactor = settings.widthValue / baseWidth;

  // Render each character with individual weight animation
  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];

    // Each character cycles through full weight range (min to max)
    const t = settings.time * settings.animationSpeed;
    const phase = charIndex * 0.3;
    const cycle = (Math.sin(t + phase) + 1) / 2;
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    const color = getColor(charIndex, 0, text.length, settings.time);

    // Scale horizontally to simulate width variation
    renderer.save();
    renderer.translate(textX, centerY);
    renderer.scale(scaleFactor, 1);
    renderer.drawText(char, 0, 0, textSize, weight, color, { baseline: 'middle' });
    renderer.restore();

    // Move to next character position
    const charWidth = renderer.measureText(char, textSize, weight);
    textX += charWidth * scaleFactor;
  }
}

function measureTextWithAnimation(renderer, text, size) {
  let textWidth = 0;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const t = settings.time * settings.animationSpeed;
    const phase = charIndex * 0.3;
    const cycle = (Math.sin(t + phase) + 1) / 2;
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    textWidth += renderer.measureText(text[charIndex], size, weight);
  }

  return textWidth;
}
