import { themePresets } from '../../../config/settings.js';
import { THEME_COLOR_CLASS_MAP } from '../constants.js';

export function createThemeComputed() {
  return {
    get currentPreset() {
      return themePresets[this.theme] || {};
    },

    get capabilities() {
      return this.currentPreset.capabilities || { animated: true, variableWeight: true };
    },

    get isAnimated() {
      return this.capabilities.animated !== false;
    },

    get bodyThemeClass() {
      return THEME_COLOR_CLASS_MAP[this.colorMode] || 'theme-violet';
    },
  };
}
