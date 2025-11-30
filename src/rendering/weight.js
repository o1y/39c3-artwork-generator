import { settings } from '../config/settings.js';
import { getNormalizedTime } from '../animation/timing.js';

// Reference to canvas context (set externally)
let ctx = null;

export function setContext(context) {
  ctx = context;
}

// Measure text width for a specific line (exact port from DrawBot)
export function getLineWidth(text, size, lineIndex, timeOffset = 0) {
  let total = 0;
  const midIndex = (text.length - 1) / 2;
  const startWeight =
    settings.maxWeight -
    ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;
  const endWeight =
    settings.minWeight +
    ((settings.maxWeight - settings.minWeight) / (settings.numLines - 1)) * lineIndex;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];
    let weight = calculateWeight(
      charIndex,
      lineIndex,
      startWeight,
      endWeight,
      midIndex,
      text.length,
      timeOffset
    );

    // Set font with variable weight
    ctx.font = `${weight} ${size}px Kario39C3`;
    const metrics = ctx.measureText(char);
    total += metrics.width;
  }
  return total;
}

// Calculate weight (exact port from DrawBot with animation)
export function calculateWeight(
  charIndex,
  lineIndex,
  startWeight,
  endWeight,
  midIndex,
  textLength,
  timeOffset
) {
  let weight;

  if (lineIndex === 0) {
    // First line: simple gradient
    weight = startWeight + ((endWeight - startWeight) / (textLength - 1)) * charIndex;
  } else if (lineIndex === settings.numLines - 1) {
    // Last line: simple gradient
    weight = startWeight + ((endWeight - startWeight) / (textLength - 1)) * charIndex;
  } else {
    // Middle lines: gradient with boost in the middle
    const baseWeight = startWeight + ((endWeight - startWeight) / (textLength - 1)) * charIndex;
    const distToMid = Math.abs(charIndex - midIndex);
    const maxBoost = (settings.maxWeight - settings.minWeight) / 2;
    const boost = maxBoost * (1 - Math.pow(distToMid / midIndex, 2));
    const boostFactor =
      1 - Math.abs(lineIndex - (settings.numLines - 1) / 2) / ((settings.numLines - 1) / 2);
    weight = baseWeight + boost * boostFactor;
  }

  // Apply animation based on mode
  weight = applyAnimation(weight, charIndex, lineIndex, timeOffset);

  return Math.max(settings.minWeight, Math.min(settings.maxWeight, weight));
}

export function applyAnimation(weight, charIndex, lineIndex, time) {
  const t = getNormalizedTime(time);

  switch (settings.mode) {
    case 'wave':
      const wave = Math.sin(t + charIndex * 0.3 + lineIndex * 0.5) * 15;
      return weight + wave;

    case 'pulse':
      const pulse = Math.sin(t * 2) * 20;
      return weight + pulse;

    case 'rotate':
      const rotate = Math.sin(t + (charIndex + lineIndex) * 0.4) * 20;
      return weight + rotate;

    case 'breathe':
      const breathe = (Math.sin(t) * 0.5 + 0.5) * 30;
      return weight + breathe - 15;

    case 'bounce':
      const bounce = Math.abs(Math.sin(t + charIndex * 0.2)) * 25;
      return weight + bounce;

    default:
      return weight;
  }
}
