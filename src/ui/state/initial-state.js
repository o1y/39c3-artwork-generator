import { settings } from '../../config/settings.js';
import { preferences } from '../../config/preferences.js';

export function createInitialState() {
  return {
    // View state
    isTextDirty: false,
    isColorModeDirty: false,
    exportAdvancedCollapsed: true,
    mobileHeaderCollapsed: true,
    isFullscreen: false,
    typographyPopoverOpen: false,
    animationPopoverOpen: false,
    spotlightHintDismissed: preferences.get('dismissedHints.spotlight'),
    toolbarHintDismissed: preferences.get('dismissedHints.toolbar'),

    // Settings state
    text: settings.text,
    theme: settings.theme,
    toggleVariant: settings.toggleVariant,
    colorMode: settings.colorMode,
    numLines: settings.numLines,
    widthValue: settings.widthValue,
    opszValue: settings.opszValue,
    minWeight: settings.minWeight,
    maxWeight: settings.maxWeight,
    animationSpeed: settings.animationSpeed,
    mode: settings.mode,
    animationOriginX: settings.animationOriginX,
    animationOriginY: settings.animationOriginY,

    // Animation state
    isPaused: false,
    currentFrame: 0,
    fps: 0,

    // Export state
    isExporting: false,
    exportProgress: 0,
    exportFormat: 'png',
    exportResolution: '2',
    exportLoops: '1',
  };
}
