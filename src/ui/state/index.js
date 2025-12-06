import { settings, themePresets } from '../../config/settings.js';
import { createInitialState } from './initial-state.js';
import { createThemeComputed } from './computed/theme-computed.js';
import { createDisplayComputed } from './computed/display-computed.js';
import { createControlsComputed } from './computed/controls-computed.js';
import { createViewActions } from './actions/view-actions.js';
import { createThemeActions } from './actions/theme-actions.js';
import { createAnimationActions } from './actions/animation-actions.js';
import { createExportActions } from './actions/export-actions.js';
import { setupWatchers, startFrameUpdateLoop } from './watchers.js';
import { initVisibilityHandler, setAlpineStore } from '../../animation/loop.js';

function mergeStoreModules(...modules) {
  const result = {};
  for (const module of modules) {
    Object.defineProperties(result, Object.getOwnPropertyDescriptors(module));
  }
  return result;
}

export function createAppStore() {
  const store = mergeStoreModules(
    createInitialState(),
    createThemeComputed(),
    createDisplayComputed(),
    createControlsComputed(),
    createViewActions(),
    createThemeActions(),
    createAnimationActions(),
    createExportActions(),
    {
      init() {
        const initialPreset = themePresets[this.theme];
        if (initialPreset && initialPreset.capabilities) {
          settings.capabilities = { ...initialPreset.capabilities };
        }

        setupWatchers(this);
        startFrameUpdateLoop(this);
        initVisibilityHandler();
        setAlpineStore(this);
        this.initFullscreenListener();
      },
    }
  );

  return store;
}
