import { settings, defaultTexts, themePresets } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { PILL_HEIGHT_RATIO, PILL_WIDTH_RATIO } from '../utils/pill-utils.js';

function getToggleWidth(fontSize) {
  const height = fontSize * PILL_HEIGHT_RATIO;
  return height * PILL_WIDTH_RATIO;
}

/**
 * Render Toggle 39C3 Theme
 * Works with any renderer (Canvas or SVG)
 */
export function renderToggle39C3Theme(renderer, canvasSize) {
  renderer.clearCanvas(canvasSize, canvasSize, getBackgroundColor());

  const logoText = defaultTexts.ccc;
  const userText = settings.text;
  if (!userText) return;

  const isAnimated = settings.capabilities && settings.capabilities.animated;
  const preset = themePresets[settings.theme];
  const textColor = getColor(0, 0, 1, settings.time);

  // Scale initial sizes proportionally to canvas size
  const baseFactor = settings.canvasSize / 1000;
  let logoSize = 200 * baseFactor;

  // Pill dimensions always match logo size
  let toggleWidth = getToggleWidth(logoSize);
  let toggleHeight = logoSize * PILL_HEIGHT_RATIO;

  let logoWidth = renderer.measureText(logoText, logoSize, settings.maxWeight);

  // Add spacing between pill and logo
  const pillLogoSpacing = logoSize * 0.2;
  let firstRowWidth = toggleWidth + pillLogoSpacing + logoWidth;

  let userTextSize = 200 * baseFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;

  // Scale down first row if needed
  if (firstRowWidth > usableWidth) {
    const scaleFactorRow1 = usableWidth / firstRowWidth;
    logoSize *= scaleFactorRow1;
    toggleWidth = getToggleWidth(logoSize);
    toggleHeight = logoSize * PILL_HEIGHT_RATIO;
    logoWidth = renderer.measureText(logoText, logoSize, settings.maxWeight);
    firstRowWidth = toggleWidth + (logoSize * 0.2) + logoWidth;
  }

  // Measure user text width
  let userTextWidth = renderer.measureText(userText, userTextSize, settings.maxWeight);
  let secondRowWidth = userTextWidth;

  // Calculate width scale factor
  let widthScaleFactor = 1.0;
  if (secondRowWidth > usableWidth) {
    widthScaleFactor = usableWidth / secondRowWidth;
    secondRowWidth = usableWidth;
  }

  const maxRowWidth = Math.max(firstRowWidth, secondRowWidth);
  if (maxRowWidth > usableWidth) {
    const globalScale = usableWidth / maxRowWidth;

    logoSize *= globalScale;
    toggleWidth = getToggleWidth(logoSize);
    toggleHeight = logoSize * PILL_HEIGHT_RATIO;
    logoWidth = renderer.measureText(logoText, logoSize, settings.maxWeight);
    firstRowWidth = toggleWidth + (logoSize * 0.15) + logoWidth;

    userTextSize *= globalScale;
    userTextWidth = renderer.measureText(userText, userTextSize, settings.maxWeight);
    secondRowWidth = userTextWidth * widthScaleFactor;
  }

  const rowSpacing = userTextSize * 0.15;
  const totalHeight = toggleHeight + rowSpacing + userTextSize;
  const startY = (settings.canvasSize - totalHeight) / 2;

  // Draw First Row: Toggle + Logo
  const row1CenterY = startY + toggleHeight / 2;
  const row1StartX = (settings.canvasSize - firstRowWidth) / 2;

  const toggleX = row1StartX;

  // Determine pill style from preset
  const pillStyle = preset && preset.pillStyle ? preset.pillStyle : 'outlined';

  // Use font pill glyph for static themes, animated pill for animated themes
  if (!isAnimated) {
    // Use font pill glyph U+E000 (outlined) or U+E001 (filled)
    const pillChar = pillStyle === 'filled' ? '\uE001' : '\uE000';
    renderer.drawText(pillChar, toggleX, row1CenterY, logoSize, settings.maxWeight, textColor, { baseline: 'middle' });
  } else {
    // Use animated custom pill
    const pillY = row1CenterY - (logoSize * PILL_HEIGHT_RATIO) / 2;
    const pillXOffset = logoSize * 0.0780;
    const bgColor = getBackgroundColor();
    renderer.drawTogglePill(toggleX + pillXOffset, pillY, logoSize, textColor, settings.time, 0, true, pillStyle, bgColor);
  }

  // Draw logo text
  const logoX = row1StartX + toggleWidth + pillLogoSpacing;
  renderer.drawText(logoText, logoX, row1CenterY, logoSize, settings.maxWeight, textColor, { baseline: 'middle' });

  // Draw Second Row: User Text with Condensed Feature
  const row2Y = startY + toggleHeight + rowSpacing + userTextSize / 2;
  const row2StartX = (settings.canvasSize - secondRowWidth) / 2;

  // Create offscreen renderer to avoid Chrome glyph cache bug
  const offscreenWidth = userTextWidth * 1.2;
  const offscreenHeight = userTextSize * 2;
  const offscreenData = renderer.createOffscreen(offscreenWidth, offscreenHeight);
  const offscreenRenderer = offscreenData.renderer;

  const offscreenY = offscreenHeight / 2;

  let currentX = 0;
  for (let charIndex = 0; charIndex < userText.length; charIndex++) {
    const char = userText[charIndex];

    // Determine weight based on animation capability
    let weight;
    if (isAnimated) {
      const t = settings.time * settings.animationSpeed;
      const phase = charIndex * 0.3;
      const cycle = (Math.sin(t + phase) + 1) / 2;
      weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;
    } else {
      weight = preset && preset.staticWeight ? preset.staticWeight : settings.maxWeight;
    }

    const color = getColor(charIndex, 0, userText.length, settings.time);
    offscreenRenderer.drawText(char, currentX, offscreenY, userTextSize, weight, color, { baseline: 'middle' });

    const charWidth = offscreenRenderer.measureText(char, userTextSize, weight);
    currentX += charWidth;
  }

  // Draw the offscreen renderer once with horizontal scaling applied
  renderer.drawOffscreen(
    offscreenData,
    0, 0, offscreenWidth, offscreenHeight,
    row2StartX, row2Y - offscreenHeight / 2, offscreenWidth * widthScaleFactor, offscreenHeight
  );
}
