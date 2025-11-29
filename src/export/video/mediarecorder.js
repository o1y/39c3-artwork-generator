import { settings } from '../../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../../rendering/canvas.js';
import { generateFilename } from '../filename.js';
import { render, pauseAnimation, resumeAnimation } from '../../animation/loop.js';

let mediaRecorder = null;
let recordedChunks = [];

export function exportVideoMediaRecorder(durationSeconds = 5, resolution = 2, callbacks = {}) {
  pauseAnimation();

  if (callbacks.onStart) {
    callbacks.onStart();
  }

  const originalCanvas = getCanvas();
  const originalCtx = getContext();
  const originalCanvasSize = settings.canvasSize;
  const originalMargin = settings.margin;

  let recordingCanvas = originalCanvas;
  let tempCanvas = null;

  if (resolution > 1) {
    const highResSize = settings.canvasSize * resolution;
    tempCanvas = document.createElement('canvas');
    tempCanvas.width = highResSize;
    tempCanvas.height = highResSize;

    tempCanvas.style.position = 'absolute';
    tempCanvas.style.left = '-9999px';
    document.body.appendChild(tempCanvas);

    recordingCanvas = tempCanvas;
    const recordingCtx = tempCanvas.getContext('2d', { alpha: false });

    settings.canvasSize = highResSize;
    settings.margin = settings.margin * resolution;

    setCanvas(tempCanvas, recordingCtx);
  }

  const targetFPS = 30;
  const stream = recordingCanvas.captureStream(targetFPS);
  recordedChunks = [];

  const codecs = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  let mimeType = 'video/webm';
  for (const codec of codecs) {
    if (MediaRecorder.isTypeSupported(codec)) {
      mimeType = codec;
      break;
    }
  }

  const baseBitrate = 16000000;
  const bitrate = baseBitrate * (resolution * resolution);

  const options = {
    mimeType: mimeType,
    videoBitsPerSecond: bitrate,
  };

  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    if (tempCanvas) {
      setCanvas(originalCanvas, originalCtx);
      settings.canvasSize = originalCanvasSize;
      settings.margin = originalMargin;
      document.body.removeChild(tempCanvas);
    }

    resumeAnimation();

    const blob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = generateFilename('webm');
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
    recordedChunks = [];
  };

  mediaRecorder.start(100);

  const timeIncrement = 1 / targetFPS;
  let startTime = performance.now();

  function renderLoop() {
    const now = performance.now();
    const elapsed = now - startTime;

    if (elapsed >= durationSeconds * 1000) {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      return;
    }

    settings.time += timeIncrement;
    render();

    const percentage = Math.min(100, Math.floor((elapsed / (durationSeconds * 1000)) * 100));
    if (callbacks.onProgress) {
      callbacks.onProgress(percentage);
    }

    requestAnimationFrame(renderLoop);
  }

  renderLoop();
}
