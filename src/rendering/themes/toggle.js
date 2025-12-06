import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';
import { getMiddleBaselineOffset } from '../../export/font-loader.js';
import { getAnimatedTogglePath } from '../utils/toggle-glyph.js';

export function renderToggleTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const text = settings.text;
  if (!text) return;

  const [position, style] = settings.toggleVariant.split('-');
  const textColor = getColor(0, 0, text.length, settings.time);

  let textSize = 200;

  const toggleGlyph = style === 'filled' ? '\uE001' : '\uE000';
  const toggleWeight = (settings.minWeight + settings.maxWeight) / 2;
  let textWidth = measureTextWithAnimation(renderer, text, textSize);
  let toggleWidth = renderer.measureText(toggleGlyph, textSize, toggleWeight);
  const spacing = textSize * 0.12;
  let totalContentWidth = toggleWidth + spacing + textWidth;

  const usableWidth = settings.canvasSize - 2 * settings.margin;
  if (totalContentWidth > usableWidth) {
    const scaleFactorInitial = usableWidth / totalContentWidth;
    textSize *= scaleFactorInitial;
    toggleWidth = renderer.measureText(toggleGlyph, textSize, toggleWeight);
    textWidth = measureTextWithAnimation(renderer, text, textSize);
    totalContentWidth = toggleWidth + spacing + textWidth;
  }

  const startX = (settings.canvasSize - totalContentWidth) / 2;
  const centerY = settings.canvasSize / 2;
  let toggleX, textX;
  if (position === 'left') {
    toggleX = startX;
    textX = startX + toggleWidth + spacing;
  } else {
    textX = startX;
    toggleX = startX + textWidth + spacing;
  }
  const t = getNormalizedTime(settings.time) * settings.animationSpeed;
  const rawProgress = (Math.sin(t) + 1) / 2;

  // Ease-in-out with sharper transition (switch flip effect)
  // Fast acceleration at start, quick snap in middle, fast deceleration at end
  const easeSwitch = (p) => {
    // Use cubic easing for snappier feel
    return p < 0.5
      ? 4 * p * p * p
      : 1 - Math.pow(-2 * p + 2, 3) / 2;
  };

  const progress = easeSwitch(rawProgress);

  const adjustedY = centerY + getMiddleBaselineOffset(textSize);
  const togglePath = getAnimatedTogglePath(
    toggleGlyph,
    toggleX,
    adjustedY,
    textSize,
    toggleWeight,
    progress
  );

  renderer.drawPath(togglePath.pathData, textColor);
  let currentTextX = textX;
  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];
    const t = getNormalizedTime(settings.time);
    const phase = charIndex * 0.3;
    const cycle = (Math.sin(t + phase) + 1) / 2;
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    const color = getColor(charIndex, 0, text.length, settings.time);

    renderer.drawText(char, currentTextX, centerY, textSize, weight, color, { baseline: 'middle' });

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
