import { settings, themePresets, defaultTexts } from '../../../config/settings.js';
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
    },
  };
}
