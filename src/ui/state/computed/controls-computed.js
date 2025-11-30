import { AVAILABLE_RESOLUTIONS } from '../constants.js';

export function createControlsComputed() {
  return {
    get controls() {
      return this.currentPreset.controls || { showLines: true, showWidth: false, showMode: true };
    },

    get showSpeedControl() {
      return this.isAnimated;
    },

    get showLinesControl() {
      return this.controls.showLines;
    },

    get showWidthControl() {
      return this.controls.showWidth;
    },

    get showModeControl() {
      return this.controls.showMode;
    },

    get showAnimationControls() {
      return this.isAnimated;
    },

    get showDurationControl() {
      return this.exportFormat === 'video';
    },

    get showResolutionControl() {
      return this.exportFormat !== 'svg';
    },

    get videoExportDisabled() {
      return !this.isAnimated;
    },

    get availableResolutions() {
      return AVAILABLE_RESOLUTIONS;
    },
  };
}
