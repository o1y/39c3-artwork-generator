import { ANIMATION_FPS, TOTAL_FRAMES } from '../constants.js';

export function createDisplayComputed() {
  return {
    get speedDisplay() {
      return this.animationSpeed.toFixed(1) + 'x';
    },

    get linesDisplay() {
      return this.numLines.toString();
    },

    get currentFrameNumber() {
      const frameNumber = Math.floor(this.framePosition * ANIMATION_FPS) % TOTAL_FRAMES;
      return frameNumber;
    },

    get frameDisplay() {
      return `Frame ${this.currentFrameNumber}/${TOTAL_FRAMES}`;
    },

    get framePercentDisplay() {
      const percent = Math.round((this.currentFrameNumber / TOTAL_FRAMES) * 100);
      return percent + '%';
    },

    get playPauseLabel() {
      return this.isPaused ? 'Play' : 'Pause';
    },

    get exportStatusLabel() {
      if (!this.isExporting) return '';
      if (this.exportFormat === 'video') {
        if (this.isChrome) {
          return 'Rendering (grab a coffee ☕)';
        }
        return 'Rendering';
      }
      return 'Exporting';
    },

    get downloadButtonText() {
      if (!this.isExporting) {
        return 'Download';
      }
      return `${this.exportStatusLabel}... ${this.exportProgress}%`;
    },

    get isChrome() {
      return /Chrome/.test(navigator.userAgent) && !/Edg|Firefox/.test(navigator.userAgent);
    },
  };
}
