import { settings, defaultTexts, themePresets } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';
import { getMiddleBaselineOffset } from '../../export/font-loader.js';
import { getAnimatedTogglePath } from '../utils/toggle-glyph.js';

export function renderToggle39C3Theme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const logoText = defaultTexts.ccc;
  const userText = settings.text;
  if (!userText) return;

  const isAnimated = settings.capabilities && settings.capabilities.animated;
  const textColor = getColor(0, 0, 1, settings.time);

  const [position, style] = settings.toggleVariant.split('-');
  const toggleGlyph = style === 'filled' ? '\uE001' : '\uE000';
  const toggleWeight = (settings.minWeight + settings.maxWeight) / 2;

  const baseFactor = settings.canvasSize / 1000;
  let logoSize = 200 * baseFactor;

  let toggleWidth = renderer.measureText(toggleGlyph, logoSize, toggleWeight);
  let logoWidth = renderer.measureText(logoText, logoSize, settings.maxWeight);

  const pillLogoSpacing = logoSize * 0.2;
  let firstRowWidth = toggleWidth + pillLogoSpacing + logoWidth;

  let userTextSize = 200 * baseFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;

  if (firstRowWidth > usableWidth) {
    const scaleFactorRow1 = usableWidth / firstRowWidth;
    logoSize *= scaleFactorRow1;
    toggleWidth = renderer.measureText(toggleGlyph, logoSize, toggleWeight);
    logoWidth = renderer.measureText(logoText, logoSize, settings.maxWeight);
    firstRowWidth = toggleWidth + logoSize * 0.2 + logoWidth;
  }

  let userTextWidth = renderer.measureText(userText, userTextSize, settings.maxWeight);
  let secondRowWidth = userTextWidth;

  let widthScaleFactor = 1.0;
  if (secondRowWidth > usableWidth) {
    widthScaleFactor = usableWidth / secondRowWidth;
    secondRowWidth = usableWidth;
  }

  const maxRowWidth = Math.max(firstRowWidth, secondRowWidth);
  if (maxRowWidth > usableWidth) {
    const globalScale = usableWidth / maxRowWidth;

    logoSize *= globalScale;
    toggleWidth = renderer.measureText(toggleGlyph, logoSize, toggleWeight);
    logoWidth = renderer.measureText(logoText, logoSize, settings.maxWeight);
    firstRowWidth = toggleWidth + logoSize * 0.15 + logoWidth;

    userTextSize *= globalScale;
    userTextWidth = renderer.measureText(userText, userTextSize, settings.maxWeight);
    secondRowWidth = userTextWidth * widthScaleFactor;
  }

  const rowSpacing = userTextSize * 0.15;
  const totalHeight = logoSize + rowSpacing + userTextSize;
  const startY = (settings.canvasSize - totalHeight) / 2;

  const row1CenterY = startY + logoSize / 2;
  const row1StartX = (settings.canvasSize - firstRowWidth) / 2;

  let toggleX, logoX;
  if (position === 'left') {
    toggleX = row1StartX;
    logoX = row1StartX + toggleWidth + pillLogoSpacing;
  } else {
    logoX = row1StartX;
    toggleX = row1StartX + logoWidth + pillLogoSpacing;
  }

  let progress = 1;
  if (isAnimated) {
    const t = getNormalizedTime(settings.time) * settings.animationSpeed;
    const rawProgress = (Math.sin(t) + 1) / 2;

    // Ease-in-out with sharper transition (switch flip effect)
    const easeSwitch = (p) => {
      return p < 0.5
        ? 4 * p * p * p
        : 1 - Math.pow(-2 * p + 2, 3) / 2;
    };

    progress = easeSwitch(rawProgress);
  }

  const adjustedToggleY = row1CenterY + getMiddleBaselineOffset(logoSize);
  const togglePath = getAnimatedTogglePath(
    toggleGlyph,
    toggleX,
    adjustedToggleY,
    logoSize,
    toggleWeight,
    progress
  );
  renderer.drawPath(togglePath.pathData, textColor);

  renderer.drawText(logoText, logoX, row1CenterY, logoSize, settings.maxWeight, textColor, {
    baseline: 'middle',
  });

  const row2Y = startY + logoSize + rowSpacing + userTextSize / 2;
  const row2StartX = (settings.canvasSize - secondRowWidth) / 2;

  const offscreenWidth = userTextWidth * 1.2;
  const offscreenHeight = userTextSize * 2;
  const offscreenData = renderer.createOffscreen(offscreenWidth, offscreenHeight);
  const offscreenRenderer = offscreenData.renderer;

  const offscreenY = offscreenHeight / 2;

  let currentX = 0;
  for (let charIndex = 0; charIndex < userText.length; charIndex++) {
    const char = userText[charIndex];
    let weight;
    if (isAnimated) {
      const t = getNormalizedTime(settings.time);
      const phase = charIndex * 0.3;
      const cycle = (Math.sin(t + phase) + 1) / 2;
      weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;
    } else {
      const preset = themePresets[settings.theme];
      weight = preset && preset.staticWeight ? preset.staticWeight : settings.maxWeight;
    }

    const color = getColor(charIndex, 0, userText.length, settings.time);
    offscreenRenderer.drawText(char, currentX, offscreenY, userTextSize, weight, color, {
      baseline: 'middle',
    });

    const charWidth = offscreenRenderer.measureText(char, userTextSize, weight);
    currentX += charWidth;
  }

  renderer.drawOffscreen(
    offscreenData,
    0,
    0,
    offscreenWidth,
    offscreenHeight,
    row2StartX,
    row2Y - offscreenHeight / 2,
    offscreenWidth * widthScaleFactor,
    offscreenHeight
  );
}
