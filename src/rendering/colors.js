import { settings } from '../config/settings.js';
import { BRAND_COLORS as colors, COLOR_MODES } from '../config/colors.js';
import { getNormalizedTime } from '../animation/timing.js';

function lerpColor(color1, color2, t) {
  t = Math.max(0, Math.min(1, t));

  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getAnimatedColor(
  palette,
  normalizedT,
  charIndex,
  lineIndex,
  smooth = false,
  textLength = 16
) {
  const slowdownFactor = 0.2;
  const cycles = Math.max(1, Math.round(palette.length * slowdownFactor));
  const multiplier = cycles / palette.length;
  const baseIndex = normalizedT * palette.length * multiplier;

  let offset;
  if (settings.mode === 'spotlight') {
    const normalizedX = textLength > 1 ? charIndex / (textLength - 1) : 0.5;
    const normalizedY = settings.numLines > 1 ? lineIndex / (settings.numLines - 1) : 0.5;
    const dx = normalizedX - settings.animationOriginX;
    const dy = normalizedY - settings.animationOriginY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    offset = distance * 0.8;
  } else {
    const charOffset = (charIndex * 0.5) / palette.length;
    const lineOffset = (lineIndex * 0.3) / palette.length;
    offset = charOffset + lineOffset;
  }

  const floatIndex = (baseIndex + offset) % 1.0;
  const paletteIndex = floatIndex * palette.length;

  if (!smooth) {
    return palette[Math.floor(paletteIndex)];
  }

  const index1 = Math.floor(paletteIndex);
  const index2 = (index1 + 1) % palette.length;
  const fraction = paletteIndex - index1;
  return lerpColor(palette[index1], palette[index2], fraction);
}

function resolveColor(colorRef) {
  if (typeof colorRef === 'string') {
    return colors[colorRef];
  }
  if (colorRef && typeof colorRef === 'object' && colorRef.palette) {
    return colors[colorRef.palette][colorRef.index];
  }
  return colors.dark;
}

export function getBackgroundColor() {
  const mode = COLOR_MODES[settings.colorMode];
  if (!mode) return colors.dark;
  return resolveColor(mode.background);
}

export function getColor(charIndex, lineIndex, time, textLength = 16) {
  const mode = COLOR_MODES[settings.colorMode];
  if (!mode) return colors.natural;

  if (mode.foreground) {
    return resolveColor(mode.foreground);
  }

  if (mode.palette) {
    const isAnimated = settings.capabilities && settings.capabilities.animated;
    const palette = colors[mode.palette];
    const staticColor = palette[mode.staticIndex];

    if (!isAnimated) {
      return staticColor;
    }

    const normalizedT = getNormalizedTime(time) / (2 * Math.PI);
    return getAnimatedColor(palette, normalizedT, charIndex, lineIndex, mode.smooth, textLength);
  }

  return colors.natural;
}
