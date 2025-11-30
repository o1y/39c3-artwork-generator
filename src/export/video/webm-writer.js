import WebMWriter from 'webm-writer';
import { settings } from '../../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../../rendering/canvas.js';
import { generateFilename } from '../filename.js';
import { render, pauseAnimation, resumeAnimation } from '../../animation/loop.js';

export async function exportVideoWebMWriter(durationSeconds = 5, resolution = 2, callbacks = {}) {
  pauseAnimation();

  if (callbacks.onStart) {
    callbacks.onStart();
  }

  try {
    const originalCanvas = getCanvas();
    const originalCtx = getContext();
    const originalCanvasSize = settings.canvasSize;
    const originalMargin = settings.margin;

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

    const totalFrames = durationSeconds * targetFPS;
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
    resumeAnimation();

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
  }
}
