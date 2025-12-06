import WebMWriter from 'webm-writer';
import { settings } from '../../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../../rendering/canvas.js';
import { render } from '../../animation/loop.js';
import { ANIMATION_FPS, TOTAL_FRAMES } from '../../ui/state/constants.js';
import { createTempCanvas, cleanupTempCanvas } from '../utils/canvas-manager.js';
import {
  captureSettingsState,
  restoreSettingsState,
  applyScaledSettings,
  resetAnimationTime,
} from '../utils/settings-state.js';
import { pauseWithState, restoreAnimationState } from '../utils/animation-control.js';
import { generateFilename, downloadBlob } from '../utils/download.js';

export async function exportVideoWebMWriter(
  loops = 1,
  animationSpeed = 1.5,
  resolution = 2,
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

    let renderCanvas = originalCanvas;
    let tempCanvas = null;

    if (resolution > 1) {
      const temp = createTempCanvas(resolution, true, false);
      tempCanvas = temp.canvas;
      const recordingCtx = temp.context;
      const scaledSize = temp.scaledSize;

      renderCanvas = tempCanvas;
      applyScaledSettings(scaledSize, resolution);
      setCanvas(tempCanvas, recordingCtx);
    }

    const targetFPS = resolution >= 2 ? 24 : 30;
    const videoWriter = new WebMWriter({
      quality: 0.95,
      frameRate: targetFPS,
      transparent: false,
      frameDelay: null,
    });

    const maxFrames = Math.round(TOTAL_FRAMES / animationSpeed);
    const actualDuration = (maxFrames * loops) / ANIMATION_FPS;
    const totalFrames = Math.round(actualDuration * targetFPS);
    const timeIncrement = 1 / targetFPS;
    const batchSize = 5;

    for (let i = 0; i < totalFrames; i += batchSize) {
      await new Promise((resolve) => setTimeout(resolve, 1));

      const end = Math.min(i + batchSize, totalFrames);
      for (let j = i; j < end; j++) {
        settings.time += timeIncrement;
        render();
        videoWriter.addFrame(renderCanvas);
      }

      const percentage = Math.floor((end / totalFrames) * 85);
      if (callbacks.onProgress) {
        callbacks.onProgress(percentage);
      }
    }

    if (callbacks.onProgress) {
      callbacks.onProgress(95);
    }

    if (tempCanvas) {
      setCanvas(originalCanvas, originalCtx);
      cleanupTempCanvas(tempCanvas);
    }

    restoreSettingsState(settingsState);

    const blob = await videoWriter.complete();
    downloadBlob(blob, generateFilename('webm'));

    if (callbacks.onProgress) {
      callbacks.onProgress(100);
    }
  } catch (error) {
    console.error('WebM export error:', error);
  } finally {
    restoreAnimationState(wasPaused);

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
  }
}
