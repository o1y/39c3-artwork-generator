import { ANIMATION_FPS, TOTAL_FRAMES } from '../ui/state/constants.js';
import { settings } from '../config/settings.js';

export function getNormalizedTime(time) {
  const maxFrames = Math.round(TOTAL_FRAMES / settings.animationSpeed);
  const currentFrame = Math.floor(time * ANIMATION_FPS) % maxFrames;
  const cycleProgress = currentFrame / maxFrames;
  return cycleProgress * 2 * Math.PI;
}
