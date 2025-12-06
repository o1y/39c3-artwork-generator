import { settings, defaultTexts, themePresets } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';
import { getMiddleBaselineOffset } from '../../export/font-loader.js';
import { getAnimatedTogglePath } from '../utils/toggle-glyph.js';

function easeSwitch(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function calculateToggleProgress(isAnimated) {
  if (!isAnimated) return 1;

  const t = getNormalizedTime(settings.time);
  const rawProgress = (Math.sin(t) + 1) / 2;
  return easeSwitch(rawProgress);
}

function measureTextWithAnimation(renderer, text, size, isAnimated, staticWeight) {
  let textWidth = 0;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    let weight;
    if (isAnimated) {
      const t = getNormalizedTime(settings.time);
      const phase = charIndex * 0.3;
      const cycle = (Math.sin(t + phase) + 1) / 2;
      weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;
    } else {
      weight = staticWeight !== undefined ? staticWeight : settings.maxWeight;
    }

    textWidth += renderer.measureText(text[charIndex], size, weight);
  }

  return textWidth;
}

function renderAnimatedText(renderer, text, startX, centerY, textSize, isAnimated, staticWeight) {
  let currentX = startX;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];
    let weight;

    if (isAnimated) {
      const t = getNormalizedTime(settings.time);
      const phase = charIndex * 0.3;
      const cycle = (Math.sin(t + phase) + 1) / 2;
      weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;
    } else {
      weight = staticWeight !== undefined ? staticWeight : settings.maxWeight;
    }

    const color = getColor(charIndex, 0, text.length, settings.time);
    renderer.drawText(char, currentX, centerY, textSize, weight, color, { baseline: 'middle' });

    const charWidth = renderer.measureText(char, textSize, weight);
    currentX += charWidth;
  }
}

function renderSingleRowLayout(renderer) {
  const text = settings.text;
  if (!text) return;

  const [position, style] = settings.toggleVariant.split('-');
  const textColor = getColor(0, 0, text.length, settings.time);
  const isAnimated = settings.capabilities?.animated !== false;

  let textSize = 200;

  const toggleGlyph = style === 'filled' ? '\uE001' : '\uE000';
  const toggleWeight = (settings.minWeight + settings.maxWeight) / 2;
  let textWidth = measureTextWithAnimation(renderer, text, textSize, isAnimated);
  let toggleWidth = renderer.measureText(toggleGlyph, textSize, toggleWeight);
  const spacing = textSize * 0.12;
  let totalContentWidth = toggleWidth + spacing + textWidth;

  const usableWidth = settings.canvasSize - 2 * settings.margin;
  if (totalContentWidth > usableWidth) {
    const scaleFactorInitial = usableWidth / totalContentWidth;
    textSize *= scaleFactorInitial;
    toggleWidth = renderer.measureText(toggleGlyph, textSize, toggleWeight);
    textWidth = measureTextWithAnimation(renderer, text, textSize, isAnimated);
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

  const progress = calculateToggleProgress(isAnimated);
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
  renderAnimatedText(renderer, text, textX, centerY, textSize, isAnimated);
}

function renderTwoRowLayout(renderer) {
  const logoText = defaultTexts.ccc;
  const userText = settings.text;
  if (!userText) return;

  const isAnimated = settings.capabilities?.animated !== false;
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

  const preset = themePresets[settings.theme];
  const staticWeight = preset?.staticWeight;
  let userTextWidth = renderer.measureText(
    userText,
    userTextSize,
    staticWeight || settings.maxWeight
  );
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
    userTextWidth = renderer.measureText(
      userText,
      userTextSize,
      staticWeight || settings.maxWeight
    );
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

  const progress = calculateToggleProgress(isAnimated);
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

  renderAnimatedText(
    offscreenRenderer,
    userText,
    0,
    offscreenHeight / 2,
    userTextSize,
    isAnimated,
    staticWeight
  );

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

export function renderToggleTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const preset = themePresets[settings.theme];
  const layoutMode = preset?.layout || 'single-row';

  if (layoutMode === 'two-row') {
    renderTwoRowLayout(renderer);
  } else {
    renderSingleRowLayout(renderer);
  }
}
