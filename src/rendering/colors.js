import { settings, colors } from '../config/settings.js';

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

function getAnimatedColor(palette, staticIndex, t, charIndex, lineIndex, smooth = false) {
  const floatIndex = (t * 2 + charIndex * 0.5 + lineIndex * 0.3) % palette.length;

  if (!smooth) {
    return palette[Math.floor(floatIndex)];
  }

  const index1 = Math.floor(floatIndex);
  const index2 = (index1 + 1) % palette.length;
  const fraction = floatIndex - index1;
  return lerpColor(palette[index1], palette[index2], fraction);
}

export function getBackgroundColor() {
  switch (settings.colorMode) {
    case 'mono-inv':
      return colors.natural; // Natural background
    case 'green-inv':
      return '#00ff00'; // Neon Green background
    case 'violet-inv':
      return '#9673ff'; // Electric Violet background
    default:
      return colors.dark; // Muted Black background
  }
}

export function getColor(charIndex, lineIndex, textLength, time) {
  const isAnimated = settings.capabilities && settings.capabilities.animated;
  const effectiveTime = isAnimated ? time : 0;
  const t = effectiveTime * settings.animationSpeed * 0.5;

  switch (settings.colorMode) {
    case 'green':
      return isAnimated ? getAnimatedColor(colors.green, 3, t, charIndex, lineIndex) : colors.green[3];

    case 'green-smooth':
      return isAnimated ? getAnimatedColor(colors.green, 3, t, charIndex, lineIndex, true) : colors.green[3];

    case 'green-inv':
    case 'violet-inv':
    case 'mono-inv':
      return colors.dark;

    case 'violet':
      return isAnimated ? getAnimatedColor(colors.violet, 2, t, charIndex, lineIndex) : colors.violet[2];

    case 'violet-smooth':
      return isAnimated ? getAnimatedColor(colors.violet, 2, t, charIndex, lineIndex, true) : colors.violet[2];

    default:
      return colors.natural;
  }
}
