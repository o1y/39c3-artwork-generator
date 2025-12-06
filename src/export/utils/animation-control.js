import { pauseAnimation, resumeAnimation, getIsPaused } from '../../animation/loop.js';

export function pauseWithState() {
  const wasPaused = getIsPaused();
  pauseAnimation();
  return wasPaused;
}

export function restoreAnimationState(wasPaused) {
  if (!wasPaused) {
    resumeAnimation();
  }
}
