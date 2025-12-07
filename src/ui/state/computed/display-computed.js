import { TOTAL_FRAMES } from '../constants.js';

export function createDisplayComputed() {
  return {
    get maxFrames() {
      // Calculate frames needed for a perfect loop at current animation speed
      // This ensures that (baseT * animationSpeed) completes exactly 2π radians
      return Math.round(TOTAL_FRAMES / this.animationSpeed);
    },

    get speedDisplay() {
      return this.animationSpeed.toFixed(1) + 'x';
    },

    get linesDisplay() {
      return this.numLines.toString();
    },

    get widthDisplay() {
      return this.widthValue.toString();
    },

    get opszDisplay() {
      return this.opszValue.toString();
    },

    get minWeightDisplay() {
      return this.minWeight.toString();
    },

    get maxWeightDisplay() {
      return this.maxWeight.toString();
    },

    get currentFrameNumber() {
      return this.currentFrame;
    },

    get frameDisplay() {
      return `Frame ${this.currentFrameNumber + 1}/${this.maxFrames}`;
    },

    get framePercentDisplay() {
      const percent = Math.round((this.currentFrameNumber / (this.maxFrames - 1)) * 100);
      return percent + '%';
    },

    get playPauseLabel() {
      return this.isPaused ? 'Play' : 'Pause';
    },

    get exportStatusLabel() {
      if (!this.isExporting) return '';
      if (this.exportFormat === 'video') {
        if (this.isChrome) {
          return 'Rendering (grab a Tschunk 🍹)';
        }
        return 'Rendering';
      }
      if (this.exportFormat === 'gif') {
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
