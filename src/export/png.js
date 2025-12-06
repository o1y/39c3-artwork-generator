import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { render } from '../animation/loop.js';
import { createTempCanvas, cleanupTempCanvas } from './utils/canvas-manager.js';
import {
  captureSettingsState,
  restoreSettingsState,
  applyScaledSettings,
} from './utils/settings-state.js';
import { generateFilename, downloadCanvas } from './utils/download.js';

export function exportPNG(resolution = 2) {
  const originalCanvas = getCanvas();
  const originalCtx = getContext();
  const settingsState = captureSettingsState();

  const {
    canvas: tempCanvas,
    context: tempCtx,
    scaledSize,
  } = createTempCanvas(resolution, true, false);

  applyScaledSettings(scaledSize, resolution);
  setCanvas(tempCanvas, tempCtx);

  render();

  setCanvas(originalCanvas, originalCtx);
  restoreSettingsState(settingsState);

  downloadCanvas(tempCanvas, 'png', generateFilename('png'), () => {
    cleanupTempCanvas(tempCanvas);
  });
}
