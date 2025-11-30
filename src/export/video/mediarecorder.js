import { settings } from '../../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../../rendering/canvas.js';
import { generateFilename } from '../filename.js';

let mediaRecorder = null;
let recordedChunks = [];

export function exportVideoMediaRecorder(durationSeconds = 5, resolution = 2, callbacks = {}) {
  const duration = durationSeconds * 1000;

  if (callbacks.onStart) {
    callbacks.onStart();
  }

  let recordingCanvas = getCanvas();
  const originalCanvas = getCanvas();
  const originalCtx = getContext();
  let tempCanvas = null;
  const originalCanvasSize = settings.canvasSize;
  const originalMargin = settings.margin;

  if (resolution > 1) {
    const highResSize = settings.canvasSize * resolution;
    tempCanvas = document.createElement('canvas');
    tempCanvas.width = highResSize;
    tempCanvas.height = highResSize;

    tempCanvas.style.position = 'absolute';
    tempCanvas.style.left = '-9999px';
    tempCanvas.style.top = '-9999px';
    document.body.appendChild(tempCanvas);

    recordingCanvas = tempCanvas;
    const recordingCtx = tempCanvas.getContext('2d', { alpha: false });

    settings.canvasSize = highResSize;
    settings.margin = settings.margin * resolution;

    setCanvas(tempCanvas, recordingCtx);
  }

  const stream = recordingCanvas.captureStream(60);
  recordedChunks = [];

  const codecs = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm',
    'video/mp4',
  ];

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

    const blob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    link.download = generateFilename(extension);
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
    recordedChunks = [];
  };

  mediaRecorder.start();

  let elapsed = 0;
  const progressInterval = setInterval(() => {
    elapsed += 100;
    const percentage = Math.min(100, (elapsed / duration) * 100);

    if (callbacks.onProgress) {
      callbacks.onProgress(Math.floor(percentage));
    }

    if (elapsed >= duration) {
      clearInterval(progressInterval);
    }
  }, 100);

  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      clearInterval(progressInterval);
    }
  }, duration);
}
