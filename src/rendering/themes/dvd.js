import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { BRAND_COLORS } from '../../config/colors.js';
import { getNormalizedTime } from '../../animation/timing.js';
import { getGlyphBounds, getGlyphs } from '../../export/font-loader.js';

const COLOR_MODES = ['violet', 'green', 'mono'];

let currentColorModeIndex = 0;
let lastEdgeHitX = -1;
let lastEdgeHitY = -1;
let cornerHitTime = -Infinity;
let lastXEdgeHitTime = -Infinity;
let lastYEdgeHitTime = -Infinity;

function getAlpineStore() {
  if (typeof window !== 'undefined' && window.Alpine) {
    const el = document.querySelector('[x-data]');
    if (el && el._x_dataStack) {
      return el._x_dataStack[0];
    }
  }
  return null;
}

function getBouncingPosition(time, boundsWidth, boundsHeight) {
  const speedX = 0.12;
  const speedY = 0.08;

  const triangleWave = (t) => {
    const normalized = t % 2;
    return normalized <= 1 ? normalized : 2 - normalized;
  };

  const normalizedX = triangleWave(time * speedX);
  const normalizedY = triangleWave(time * speedY);

  const x = normalizedX * boundsWidth;
  const y = normalizedY * boundsHeight;

  const edgeThreshold = 0.01;
  const atLeftEdge = normalizedX < edgeThreshold;
  const atRightEdge = normalizedX > 1 - edgeThreshold;
  const atTopEdge = normalizedY < edgeThreshold;
  const atBottomEdge = normalizedY > 1 - edgeThreshold;

  const currentEdgeX = atLeftEdge ? 0 : atRightEdge ? 1 : -1;
  const currentEdgeY = atTopEdge ? 0 : atBottomEdge ? 1 : -1;

  let colorChanged = false;

  if (currentEdgeX !== -1 && currentEdgeX !== lastEdgeHitX) {
    currentColorModeIndex = (currentColorModeIndex + 1) % COLOR_MODES.length;
    colorChanged = true;
    lastEdgeHitX = currentEdgeX;
    lastXEdgeHitTime = time;
  } else if (currentEdgeX === -1) {
    lastEdgeHitX = -1;
  }

  if (currentEdgeY !== -1 && currentEdgeY !== lastEdgeHitY) {
    currentColorModeIndex = (currentColorModeIndex + 1) % COLOR_MODES.length;
    colorChanged = true;
    lastEdgeHitY = currentEdgeY;
    lastYEdgeHitTime = time;
  } else if (currentEdgeY === -1) {
    lastEdgeHitY = -1;
  }

  if (colorChanged) {
    const newColorMode = COLOR_MODES[currentColorModeIndex];
    settings.colorMode = newColorMode;
    const store = getAlpineStore();
    if (store) {
      store.colorMode = newColorMode;
    }
  }

  const cornerWindow = 0.3;
  const bothEdgesHitRecently =
    Math.abs(lastXEdgeHitTime - lastYEdgeHitTime) < cornerWindow &&
    time - Math.max(lastXEdgeHitTime, lastYEdgeHitTime) < cornerWindow;

  if (bothEdgesHitRecently && time - cornerHitTime > 1) {
    cornerHitTime = time;
  }

  return { x, y };
}

function measureGlyphsWidth(renderer, glyphs, fontSize, weight) {
  let width = 0;
  for (let i = 0; i < glyphs.length; i++) {
    width += renderer.measureGlyph(glyphs[i], fontSize, weight);
  }
  return width;
}

export function renderDVDTheme(renderer, canvasSize) {
  const isScreenFlashing = settings.time - cornerHitTime < 0.15;

  if (isScreenFlashing) {
    renderer.drawBackground(canvasSize, canvasSize, BRAND_COLORS.natural);
  } else {
    renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());
  }

  const logo39C3 = '\uE002';
  const logoGlyphs = getGlyphs(logo39C3);
  const t = getNormalizedTime(settings.time);
  const time = settings.time;

  const baseFactor = canvasSize / 1000;
  const fontSize = 80 * baseFactor;

  const pulse = (Math.sin(t * 2) + 1) / 2;
  const weight =
    settings.minWeight + (settings.maxWeight - settings.minWeight) * (0.5 + pulse * 0.3);

  const logoWidth = measureGlyphsWidth(renderer, logoGlyphs, fontSize, weight);
  const bounds = getGlyphBounds(logo39C3, fontSize, weight);
  const logoHeight = bounds.height;
  const bottomOverhang = Math.max(0, bounds.bottom);

  const boundsWidth = canvasSize - logoWidth;
  const boundsHeight = canvasSize - logoHeight;

  const { x, y } = getBouncingPosition(time, boundsWidth, boundsHeight);

  const logoX = x;
  const logoY = y - bottomOverhang;

  renderer.save();
  renderer.translate(logoX + logoWidth / 2, logoY + logoHeight / 2);

  let glyphX = -logoWidth / 2;
  const drawY = bounds.ascender - logoHeight / 2;

  for (let i = 0; i < logoGlyphs.length; i++) {
    const glyph = logoGlyphs[i];
    const color = isScreenFlashing ? BRAND_COLORS.dark : getColor(i, 0, time);
    const glyphPhase = i * 0.4;
    const glyphPulse = (Math.sin(t + glyphPhase) + 1) / 2;
    const glyphWeight = settings.minWeight + (settings.maxWeight - settings.minWeight) * glyphPulse;

    renderer.drawGlyph(glyph, glyphX, drawY, fontSize, glyphWeight, color, {
      baseline: 'alphabetic',
    });

    glyphX += renderer.measureGlyph(glyph, fontSize, glyphWeight);
  }

  renderer.restore();
}
