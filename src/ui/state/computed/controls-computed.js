import {
  AVAILABLE_RESOLUTIONS,
  AVAILABLE_GIF_RESOLUTIONS,
  COLOR_MODE_OPTIONS,
  MAX_EXPORT_FRAMES,
  TOTAL_FRAMES,
} from '../constants.js';

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

    get showToggleVariantControl() {
      return this.controls.showToggleVariant;
    },

    get availableColorModes() {
      const showSmoothColorModes = this.controls.showSmoothColorModes !== false;

      if (showSmoothColorModes) {
        return COLOR_MODE_OPTIONS;
      }

      return COLOR_MODE_OPTIONS.filter((option) => !option.value.includes('-smooth'));
    },

    get showAnimationControls() {
      return this.isAnimated;
    },

    get showDurationControl() {
      return this.exportFormat === 'video' || this.exportFormat === 'gif';
    },

    get showResolutionControl() {
      return this.exportFormat !== 'svg';
    },

    get videoExportDisabled() {
      return !this.isAnimated;
    },

    get availableResolutions() {
      return this.exportFormat === 'gif' ? AVAILABLE_GIF_RESOLUTIONS : AVAILABLE_RESOLUTIONS;
    },

    get availableDurations() {
      // Calculate frames per loop at current animation speed
      const framesPerLoop = Math.round(TOTAL_FRAMES / this.animationSpeed);

      // Generate loop options that don't exceed MAX_EXPORT_FRAMES
      const options = [];

      // Always offer 1 loop
      options.push({
        value: '1',
        label: `1 Loop (${framesPerLoop} frames)`,
      });

      // Offer 2 loops if it doesn't exceed max frames
      if (framesPerLoop * 2 <= MAX_EXPORT_FRAMES) {
        options.push({
          value: '2',
          label: `2 Loops (${framesPerLoop * 2} frames)`,
        });
      }

      // Offer 4 loops if it doesn't exceed max frames
      if (framesPerLoop * 4 <= MAX_EXPORT_FRAMES) {
        options.push({
          value: '4',
          label: `4 Loops (${framesPerLoop * 4} frames)`,
        });
      }

      return options;
    },

    get showExportAdvancedToggle() {
      return this.showResolutionControl || this.showDurationControl;
    },
  };
}
