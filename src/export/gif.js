import GIF from 'gif.js';
import { settings } from '../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { generateFilename } from './filename.js';
import { render, pauseAnimation, resumeAnimation, getIsPaused } from '../animation/loop.js';
import { ANIMATION_FPS, TOTAL_FRAMES } from '../ui/state/constants.js';

export async function exportGIF(loops = 1, animationSpeed = 1.5, resolution = 1000, callbacks = {}) {
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

    const gifScale = resolution / settings.canvasSize;

    tempCanvas = document.createElement('canvas');
    tempCanvas.width = resolution;
    tempCanvas.height = resolution;

    tempCanvas.style.position = 'absolute';
    tempCanvas.style.left = '-9999px';
    document.body.appendChild(tempCanvas);

    renderCanvas = tempCanvas;
    const recordingCtx = tempCanvas.getContext('2d', { alpha: false });

    settings.canvasSize = resolution;
    settings.margin = settings.margin * gifScale;

    setCanvas(tempCanvas, recordingCtx);

    // Use 15 FPS for GIFs to reduce file size while maintaining smoothness
    const targetFPS = 15;
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: renderCanvas.width,
      height: renderCanvas.height,
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
        gif.addFrame(renderCanvas, { copy: true, delay });
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
    settings.canvasSize = originalCanvasSize;
    settings.margin = originalMargin;
    document.body.removeChild(tempCanvas);

    settings.time = originalTime;
    settings.animationSpeed = originalAnimationSpeed;

    gif.on('progress', (progress) => {
      const percentage = 75 + Math.floor(progress * 20);
      if (callbacks.onProgress) {
        callbacks.onProgress(percentage);
      }
    });

    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = generateFilename('gif');
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      if (callbacks.onProgress) {
        callbacks.onProgress(100);
      }

      if (!wasPaused) {
        resumeAnimation();
      }

      if (callbacks.onComplete) {
        callbacks.onComplete();
      }
    });

    gif.render();
  } catch (error) {
    console.error('GIF export error:', error);

    if (!wasPaused) {
      resumeAnimation();
    }

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
  }
}
