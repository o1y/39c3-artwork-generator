import { settings } from '../config/settings.js';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { generateFilename } from './filename.js';

let mediaRecorder = null;
let recordedChunks = [];

export function exportVideo(durationSeconds = 5, resolution = 2, callbacks = {}) {
  const duration = durationSeconds * 1000; // Convert to ms

  // Call onStart callback if provided
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
    // Create temporary high-res canvas for recording
    const highResSize = settings.canvasSize * resolution;
    tempCanvas = document.createElement('canvas');
    tempCanvas.width = highResSize;
    tempCanvas.height = highResSize;

    // Attach to DOM. Required to fix font rendering in detached canvases
    tempCanvas.style.position = 'absolute';
    tempCanvas.style.left = '-9999px';
    tempCanvas.style.top = '-9999px';
    document.body.appendChild(tempCanvas);

    recordingCanvas = tempCanvas;
    const recordingCtx = tempCanvas.getContext('2d', { alpha: false });

    // Temporarily scale settings
    settings.canvasSize = highResSize;
    settings.margin = settings.margin * resolution;

    // Swap canvas references for rendering
    setCanvas(tempCanvas, recordingCtx);
  }

  const stream = recordingCanvas.captureStream(60); // 60 fps
  recordedChunks = [];

  const codecs = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm',
    'video/mp4',
  ];

  let mimeType = 'video/webm'; // default fallback
  for (const codec of codecs) {
    if (MediaRecorder.isTypeSupported(codec)) {
      mimeType = codec;
      break;
    }
  }

  // Scale bitrate with resolution (4x pixels = 4x bitrate)
  // 16 Mbps base for 60fps (doubled from 8 Mbps @ 30fps)
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
    // Restore original canvas and settings if using temp canvas
    if (tempCanvas) {
      setCanvas(originalCanvas, originalCtx);
      settings.canvasSize = originalCanvasSize;
      settings.margin = originalMargin;

      // Clean up: remove temporary canvas from DOM
      document.body.removeChild(tempCanvas);
    }

    const blob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Determine file extension from mimeType
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    link.download = generateFilename(extension);
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // Call onComplete callback if provided
    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
    recordedChunks = [];
  };

  mediaRecorder.start();

  // Track progress
  let elapsed = 0;
  const progressInterval = setInterval(() => {
    elapsed += 100;
    const percentage = Math.min(100, (elapsed / duration) * 100);

    // Call onProgress callback if provided
    if (callbacks.onProgress) {
      callbacks.onProgress(Math.floor(percentage));
    }

    if (elapsed >= duration) {
      clearInterval(progressInterval);
    }
  }, 100);

  // Stop after duration
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      clearInterval(progressInterval);
    }
  }, duration);
}
