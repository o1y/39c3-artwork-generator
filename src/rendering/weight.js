import { settings } from '../config/settings.js';
import { getNormalizedTime } from '../animation/timing.js';

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
  weight = applyAnimation(weight, charIndex, lineIndex, timeOffset, textLength);

  return Math.max(settings.minWeight, Math.min(settings.maxWeight, weight));
}

export function applyAnimation(weight, charIndex, lineIndex, time, textLength = 16) {
  const t = getNormalizedTime(time);

  switch (settings.mode) {
    case 'wave': {
      const wave = Math.sin(t + charIndex * 0.3 + lineIndex * 0.5) * 15;
      return weight + wave;
    }
    case 'pulse': {
      const pulse = Math.sin(t * 2) * 20;
      return weight + pulse;
    }
    case 'rotate': {
      const rotate = Math.sin(t + (charIndex + lineIndex) * 0.4) * 20;
      return weight + rotate;
    }
    case 'breathe': {
      const breathe = (Math.sin(t) * 0.5 + 0.5) * 30;
      return weight + breathe - 15;
    }
    case 'bounce': {
      const bounce = Math.abs(Math.sin(t + charIndex * 0.2)) * 25;
      return weight + bounce;
    }
    case 'spotlight': {
      const normalizedX = textLength > 1 ? charIndex / (textLength - 1) : 0.5;
      const normalizedY = settings.numLines > 1 ? lineIndex / (settings.numLines - 1) : 0.5;
      const dx = normalizedX - settings.animationOriginX;
      const dy = normalizedY - settings.animationOriginY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(2);

      const wavePhase = t - settings.animationPhaseOffset - distance * 6;
      const proximity = 1 - distance / maxDist;
      const wave = (Math.sin(wavePhase) + 1) / 2;
      const blend = proximity * 0.5 + wave * 0.5;

      return settings.minWeight + (settings.maxWeight - settings.minWeight) * blend;
    }
    default:
      return weight;
  }
}
