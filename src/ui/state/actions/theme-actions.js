import { settings, themePresets, defaultTexts } from '../../../config/settings.js';

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

      if (!this.isColorModeDirty && preset && preset.colorMode) {
        this.colorMode = preset.colorMode;
      }

      if (!this.isAnimated && (this.exportFormat === 'video' || this.exportFormat === 'gif')) {
        this.exportFormat = 'png';
      }
    },
  };
}
