import { getNormalizedTime } from '../../animation/timing.js';

export const PILL_HEIGHT_RATIO = 0.67;
export const PILL_WIDTH_RATIO = 2.2;

export function calculatePillDimensions(fontSize) {
  const height = fontSize * PILL_HEIGHT_RATIO;
  const width = height * PILL_WIDTH_RATIO;
  const radius = height / 2;
  const strokeWidth = height * 0.045;
  const dotRadius = radius * 0.8;
  const dotTravel = width - radius * 2;

  return { height, width, radius, strokeWidth, dotRadius, dotTravel };
}

export function calculateDotPosition(x, width, radius, time, phase, useConstantSpeed, animSpeed) {
  const dotTravel = width - radius * 2;
  const t = getNormalizedTime(time) * (useConstantSpeed ? 1 : animSpeed);
  const dotProgress = (Math.sin(t + phase) + 1) / 2;
  return x + radius + dotTravel * dotProgress;
}
