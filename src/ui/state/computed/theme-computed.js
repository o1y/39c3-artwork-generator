import { themePresets } from '../../../config/settings.js';
import { THEME_COLOR_CLASS_MAP } from '../constants.js';

/**
 * @typedef {import('../../../types.js').ThemePreset} ThemePreset
 * @typedef {import('../../../types.js').Capabilities} Capabilities
 */

export function createThemeComputed() {
  return {
    /** @returns {ThemePreset | {}} */
    get currentPreset() {
      return themePresets[this.theme] || {};
    },

    /** @returns {Capabilities} */
    get capabilities() {
      const preset = /** @type {ThemePreset} */ (this.currentPreset);
      return preset.capabilities || { animated: true, variableWeight: true };
    },

    get isAnimated() {
      return this.capabilities.animated !== false;
    },

    get bodyThemeClass() {
      return THEME_COLOR_CLASS_MAP[this.colorMode] || 'theme-violet';
    },
  };
}
