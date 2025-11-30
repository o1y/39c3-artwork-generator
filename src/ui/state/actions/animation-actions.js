import { pauseAnimation, resumeAnimation } from '../../../animation/loop.js';

export function createAnimationActions() {
  return {
    togglePlayPause() {
      if (this.isPaused) {
        resumeAnimation();
        this.isPaused = false;
      } else {
        pauseAnimation();
        this.isPaused = true;
      }
    },

    onFrameSliderInput() {
      if (!this.isPaused) {
        pauseAnimation();
        this.isPaused = true;
      }
    },
  };
}
