import {
  AVAILABLE_RESOLUTIONS,
  AVAILABLE_GIF_RESOLUTIONS,
  COLOR_MODE_OPTIONS,
  ANIMATION_MODE_OPTIONS,
  EXPORT_FORMAT_OPTIONS,
  MAX_EXPORT_FRAMES,
  TOTAL_FRAMES,
} from '../constants.js';
import { MAX_TEXT_LENGTH, MAX_MULTILINE_TEXT_LENGTH } from '../../../config/settings.js';
import { COLOR_MODES, BRAND_COLORS } from '../../../config/colors.js';

export function createControlsComputed() {
  return {
    get controls() {
      return this.currentPreset.controls || { showLines: true, showWidth: false, showMode: true };
    },

    get showSpeedControl() {
      return this.isAnimated && this.controls.showAnimationSpeed !== false;
    },

    get showLinesControl() {
      return this.controls.showLines;
    },

    get showWidthControl() {
      return this.controls.showWidth;
    },

    get showOpszControl() {
      if (!this.controls.showOpsz) return false;
      const ascenderDescenderChars = /[bdfhkltgijpqy\uE002]/;
      return ascenderDescenderChars.test(this.text);
    },

    get showMinWeightControl() {
      return this.controls.showMinWeight;
    },

    get showMaxWeightControl() {
      return this.controls.showMaxWeight;
    },

    get showStaticWeightControl() {
      return this.controls.showStaticWeight;
    },

    get showModeControl() {
      return this.controls.showMode;
    },

    get showToggleVariantControl() {
      return this.controls.showToggleVariant;
    },

    get showColorModeControl() {
      return this.controls.showColorMode !== false;
    },

    get availableColorModes() {
      const showGradientColorModes = this.controls.showGradientColorModes !== false;

      if (showGradientColorModes) {
        return COLOR_MODE_OPTIONS;
      }

      const gradientModes = ['green', 'green-smooth', 'violet', 'violet-smooth'];
      return COLOR_MODE_OPTIONS.filter((option) => !gradientModes.includes(option.value));
    },

    get currentColorMode() {
      return COLOR_MODES[this.colorMode] || COLOR_MODES.mono;
    },

    get currentColorPreview() {
      return this.currentColorMode.preview || { fg: BRAND_COLORS.natural, bg: BRAND_COLORS.dark };
    },

    get currentColorLabel() {
      return this.currentColorMode.label || 'Color';
    },

    get showTextInput() {
      return this.controls.showTextInput !== false;
    },

    get showMultilineInput() {
      return this.controls.showMultilineInput === true;
    },

    get maxTextLength() {
      return this.showMultilineInput ? MAX_MULTILINE_TEXT_LENGTH : MAX_TEXT_LENGTH;
    },

    get showAnimationControls() {
      return this.isAnimated && this.controls.showPlayControls !== false;
    },

    get showExportControls() {
      return this.controls.showExport !== false;
    },

    get showFooter() {
      return this.showAnimationControls || this.showExportControls;
    },

    get showFullscreenButton() {
      return this.controls.showFullscreen !== false;
    },

    get showDurationControl() {
      return (
        this.showExportControls && (this.exportFormat === 'video' || this.exportFormat === 'gif')
      );
    },

    get showResolutionControl() {
      return this.showExportControls && this.exportFormat !== 'svg' && this.exportFormat !== 'fax';
    },

    get videoExportDisabled() {
      return !this.isAnimated || this.controls.showVideoExport === false;
    },

    get availableResolutions() {
      return this.exportFormat === 'gif' ? AVAILABLE_GIF_RESOLUTIONS : AVAILABLE_RESOLUTIONS;
    },

    get availableAnimationModes() {
      return ANIMATION_MODE_OPTIONS;
    },

    get availableExportFormats() {
      return EXPORT_FORMAT_OPTIONS.map((format) => ({
        ...format,
        disabled: format.animated && this.videoExportDisabled,
      }));
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

    get showGallerySave() {
      return this.theme !== 'dvd';
    },
  };
}
