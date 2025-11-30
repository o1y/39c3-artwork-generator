import WebMWriter from 'webm-writer';
import { settings } from '../../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../../rendering/canvas.js';
import { generateFilename } from '../filename.js';
import { render, pauseAnimation, resumeAnimation, getIsPaused } from '../../animation/loop.js';
import { ANIMATION_FPS, TOTAL_FRAMES } from '../../ui/state/constants.js';

export async function exportVideoWebMWriter(loops = 1, animationSpeed = 1.5, resolution = 2, callbacks = {}) {
  const wasPaused = getIsPaused();
  pauseAnimation();

  if (callbacks.onStart) {
    callbacks.onStart();
  }

  try {
    const originalCanvas = getCanvas();
    const originalCtx = getContext();
    const originalCanvasSize = settings.canvasSize;
    const originalMargin = settings.margin;
    const originalTime = settings.time;
    const originalAnimationSpeed = settings.animationSpeed;

    settings.time = 0;
    settings.animationSpeed = animationSpeed;

    let renderCanvas = originalCanvas;
    let tempCanvas = null;

    if (resolution > 1) {
      const highResSize = settings.canvasSize * resolution;
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = highResSize;
      tempCanvas.height = highResSize;

      tempCanvas.style.position = 'absolute';
      tempCanvas.style.left = '-9999px';
      document.body.appendChild(tempCanvas);

      renderCanvas = tempCanvas;
      const recordingCtx = tempCanvas.getContext('2d', { alpha: false });

      settings.canvasSize = highResSize;
      settings.margin = settings.margin * resolution;

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
      settings.canvasSize = originalCanvasSize;
      settings.margin = originalMargin;
      document.body.removeChild(tempCanvas);
    }

    settings.time = originalTime;
    settings.animationSpeed = originalAnimationSpeed;

    const blob = await videoWriter.complete();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = generateFilename('webm');
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    if (callbacks.onProgress) {
      callbacks.onProgress(100);
    }
  } catch (error) {
    console.error('WebM export error:', error);
  } finally {
    if (!wasPaused) {
      resumeAnimation();
    }

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
  }
}
