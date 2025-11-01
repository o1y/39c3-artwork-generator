import { settings } from '../config/settings.js';
import { getBackgroundColor, getColor } from './colors.js';
import { getContext } from './canvas.js';

// Helper function to measure text with character-level animation (extracted to avoid duplication)
function measureTextWithAnimation(text, size) {
  const ctx = getContext();
  let textWidth = 0;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];

    // Each character cycles through full weight range (min to max)
    // Use phase offset based on character position for wave effect
    const t = settings.time * settings.animationSpeed;
    const phase = charIndex * 0.3; // Phase offset per character
    const cycle = (Math.sin(t + phase) + 1) / 2; // 0 to 1
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    ctx.font = `${weight} ${size}px Kario39C3`;
    const metrics = ctx.measureText(char);
    textWidth += metrics.width;
  }

  return textWidth;
}

// Draw toggle switch
export function drawToggle(x, y, height, color, time, phase, useConstantSpeed = false) {
  const ctx = getContext();
  const width = height * 2.5; // Pill shape ratio
  const radius = height / 2;

  // Draw toggle pill background
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, Math.PI / 2, Math.PI * 1.5);
  ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Calculate dot position (animated)
  const dotRadius = radius * 0.7;
  const dotTravel = width - radius * 2;
  // Use constant speed for toggle theme, respect animation speed for lines theme
  const animSpeed = useConstantSpeed ? 1 : settings.animationSpeed;
  const dotProgress = (Math.sin(time * animSpeed + phase) + 1) / 2; // 0 to 1
  const dotX = x + radius + dotTravel * dotProgress;
  const dotY = y + radius;

  // Draw inner dot (contrasting color)
  const bgColor = getBackgroundColor();
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
}

// Render toggle theme (one toggle + one text, centered)
export function renderToggleTheme(canvas) {
  const ctx = getContext();
  ctx.fillStyle = getBackgroundColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const text = settings.text;
  if (!text) return;

  const textColor = getColor(0, 0, text.length, settings.time);

  let toggleHeight = 120;
  let toggleWidth = toggleHeight * 2.5;
  let spacing = 60;
  let testSize = 200;

  // Measure text width at initial size (account for per-character weight animation)
  let textWidth = measureTextWithAnimation(text, testSize);
  let totalContentWidth = toggleWidth + spacing + textWidth;

  // Check if content fits, if not scale down
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  if (totalContentWidth > usableWidth) {
    const scaleFactorInitial = usableWidth / totalContentWidth;

    // Scale everything proportionally
    toggleHeight *= scaleFactorInitial;
    toggleWidth = toggleHeight * 2.5;
    spacing *= scaleFactorInitial;
    testSize *= scaleFactorInitial;

    // Recalculate text width with new size (account for per-character weight animation)
    textWidth = measureTextWithAnimation(text, testSize);
    totalContentWidth = toggleWidth + spacing + textWidth;
  }

  // Center horizontally and vertically
  const startX = (settings.canvasSize - totalContentWidth) / 2;
  const centerY = settings.canvasSize / 2;

  // Draw toggle on the left, aligned to center (constant speed)
  const toggleX = startX;
  const toggleY = centerY - toggleHeight / 2;
  drawToggle(toggleX, toggleY, toggleHeight, textColor, settings.time, 0, true);

  // Draw text on the right, aligned to center - render each character individually
  let textX = startX + toggleWidth + spacing;

  // Apply width from slider (50-100 range)
  // Scale horizontally to simulate variable font width axis
  const baseWidth = 76; // Default/reference width
  const scaleFactor = settings.widthValue / baseWidth;

  ctx.textBaseline = 'middle';

  // Render each character with individual weight animation
  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];

    // Each character cycles through full weight range (min to max)
    // Use phase offset based on character position for wave effect
    const t = settings.time * settings.animationSpeed;
    const phase = charIndex * 0.3;
    const cycle = (Math.sin(t + phase) + 1) / 2;
    const weight = settings.minWeight + (settings.maxWeight - settings.minWeight) * cycle;

    // Set font with animated weight
    ctx.font = `${weight} ${testSize}px Kario39C3`;
    ctx.fillStyle = getColor(charIndex, 0, text.length, settings.time);

    // Scale horizontally to simulate width variation and draw character
    ctx.save();
    ctx.translate(textX, centerY);
    ctx.scale(scaleFactor, 1);
    ctx.fillText(char, 0, 0);
    ctx.restore();

    // Move to next character position
    const metrics = ctx.measureText(char);
    textX += metrics.width * scaleFactor;
  }
}
