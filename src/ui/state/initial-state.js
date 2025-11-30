import { settings } from '../../config/settings.js';

export function createInitialState() {
  return {
    // View state
    isTextDirty: false,
    isColorModeDirty: false,
    exportAdvancedCollapsed: true,
    mobileHeaderCollapsed: true,

    // Settings state
    text: settings.text,
    theme: settings.theme,
    toggleVariant: settings.toggleVariant,
    colorMode: settings.colorMode,
    numLines: settings.numLines,
    animationSpeed: settings.animationSpeed,
    mode: settings.mode,

    // Animation state
    isPaused: false,
    currentFrame: 0,

    // Export state
    isExporting: false,
    exportProgress: 0,
    exportFormat: 'png',
    exportResolution: '2',
    exportLoops: '1',
  };
}
