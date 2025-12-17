import {
  settings,
  themePresets,
  defaultTexts,
  MAX_TEXT_LENGTH,
  MAX_MULTILINE_TEXT_LENGTH,
} from '../../../config/settings.js';
import { resumeAnimation } from '../../../animation/loop.js';

export function createThemeActions() {
  return {
    onThemeChange(newTheme) {
      settings.theme = newTheme;
      const preset = themePresets[newTheme];

      if (preset && preset.capabilities) {
        settings.capabilities = { ...preset.capabilities };
      }

      if (!this.isTextDirty && preset) {
        if (preset.numLines) {
          this.numLines = preset.numLines;
        }

        if (preset.text) {
          this.text = preset.text;
        }

        if (newTheme !== 'ccc' && this.text === defaultTexts.ccc) {
          this.text = defaultTexts.default;
        }
      }

      if (preset && preset.colorMode) {
        if (newTheme === 'dvd' || !this.isColorModeDirty) {
          this.colorMode = preset.colorMode;
        }
      }

      if (newTheme === 'dvd' && this.isPaused) {
        resumeAnimation();
        this.isPaused = false;
      }

      if (!this.isAnimated && (this.exportFormat === 'video' || this.exportFormat === 'gif')) {
        this.exportFormat = 'png';
      }

      if (preset?.controls?.showMode === false) {
        this.mode = 'wave';
        this.animationOriginX = 1;
        this.animationOriginY = 1;
        this.animationPhaseOffset = 0;
      }

      if (preset?.controls?.showWidth === false) {
        this.widthValue = 100;
      }

      // Handle text constraints when switching themes
      const isMultiline = preset?.controls?.showMultilineInput;
      if (!isMultiline) {
        this.text = this.text.replace(/\n/g, ' ');
      }
      const maxLen = isMultiline ? MAX_MULTILINE_TEXT_LENGTH : MAX_TEXT_LENGTH;
      if (this.text.length > maxLen) {
        this.text = this.text.slice(0, maxLen);
      }
    },
  };
}
