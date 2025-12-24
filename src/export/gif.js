import GIF from 'gif.js';
import { settings } from '../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { render } from '../animation/loop.js';
import { ANIMATION_FPS, TOTAL_FRAMES } from '../ui/state/constants.js';
import { createTempCanvas, cleanupTempCanvas, calculateGifScale } from './utils/canvas-manager.js';
import {
  captureSettingsState,
  restoreSettingsState,
  applyScaledSettings,
  resetAnimationTime,
} from './utils/settings-state.js';
import { pauseWithState, restoreAnimationState } from './utils/animation-control.js';
import { generateFilename, downloadBlob } from './utils/download.js';

export async function exportGIF(
  loops = 1,
  animationSpeed = 1.5,
  resolution = 1000,
  callbacks = {}
) {
  const wasPaused = pauseWithState();

  if (callbacks.onStart) {
    callbacks.onStart();
  }

  try {
    const originalCanvas = getCanvas();
    const originalCtx = getContext();
    const settingsState = captureSettingsState();

    resetAnimationTime(animationSpeed);

    const gifScale = calculateGifScale(resolution);
    const { canvas: tempCanvas, context: recordingCtx } = createTempCanvas(gifScale, true, false);

    applyScaledSettings(resolution, gifScale);
    setCanvas(tempCanvas, recordingCtx);

    const targetFPS = 15;
    const quality = resolution === 500 ? 1 : 10;
    const gif = new GIF({
      workers: 2,
      quality,
      width: tempCanvas.width,
      height: tempCanvas.height,
      workerScript: '/gif.worker.js',
    });

    const maxFrames = Math.round(TOTAL_FRAMES / animationSpeed);
    const actualDuration = (maxFrames * loops) / ANIMATION_FPS;
    const totalFrames = Math.round(actualDuration * targetFPS);
    const timeIncrement = 1 / targetFPS;
    const delay = Math.round(1000 / targetFPS);
    const batchSize = 5;

    for (let i = 0; i < totalFrames; i += batchSize) {
      await new Promise((resolve) => setTimeout(resolve, 1));

      const end = Math.min(i + batchSize, totalFrames);
      for (let j = i; j < end; j++) {
        settings.time += timeIncrement;
        render();
        gif.addFrame(tempCanvas, { copy: true, delay });
      }

      const percentage = Math.floor((end / totalFrames) * 70);
      if (callbacks.onProgress) {
        callbacks.onProgress(percentage);
      }
    }

    if (callbacks.onProgress) {
      callbacks.onProgress(75);
    }

    setCanvas(originalCanvas, originalCtx);
    restoreSettingsState(settingsState);
    cleanupTempCanvas(tempCanvas);

    gif.on('progress', (progress) => {
      const percentage = 75 + Math.floor(progress * 20);
      if (callbacks.onProgress) {
        callbacks.onProgress(percentage);
      }
    });

    gif.on('finished', (blob) => {
      downloadBlob(blob, generateFilename('gif'));

      if (callbacks.onProgress) {
        callbacks.onProgress(100);
      }

      restoreAnimationState(wasPaused);

      if (callbacks.onComplete) {
        callbacks.onComplete();
      }
    });

    gif.render();
  } catch (error) {
    console.error('GIF export error:', error);

    restoreAnimationState(wasPaused);

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
  }
}
