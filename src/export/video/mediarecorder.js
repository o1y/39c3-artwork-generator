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

let mediaRecorder = null;
let recordedChunks = [];

export function exportVideoMediaRecorder(
  loops = 1,
  animationSpeed = 1.5,
  resolution = 2,
  callbacks = {}
) {
  const wasPaused = pauseWithState();

  const maxFrames = Math.round(TOTAL_FRAMES / animationSpeed);

  if (callbacks.onStart) {
    callbacks.onStart();
  }

  const originalCanvas = getCanvas();
  const originalCtx = getContext();
  const settingsState = captureSettingsState();

  resetAnimationTime(animationSpeed);

  let recordingCanvas = originalCanvas;
  let tempCanvas = null;

  if (resolution > 1) {
    const temp = createTempCanvas(resolution, true, false);
    tempCanvas = temp.canvas;
    const recordingCtx = temp.context;
    const scaledSize = temp.scaledSize;

    recordingCanvas = tempCanvas;
    applyScaledSettings(scaledSize, resolution);
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
      cleanupTempCanvas(tempCanvas);
    }

    restoreSettingsState(settingsState);

    const blob = new Blob(recordedChunks, { type: mimeType });
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    downloadBlob(blob, generateFilename(extension));

    restoreAnimationState(wasPaused);

    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
    recordedChunks = [];
  };

  mediaRecorder.start();

  let frameIndex = 0;
  const totalFramesToRender = maxFrames * loops;
  const timeIncrementPerFrame = 1 / ANIMATION_FPS;

  function renderNextFrame() {
    if (frameIndex < totalFramesToRender) {
      settings.time = frameIndex * timeIncrementPerFrame;
      render();
      frameIndex++;

      if (callbacks.onProgress) {
        const percentage = Math.floor((frameIndex / totalFramesToRender) * 100);
        callbacks.onProgress(percentage);
      }

      setTimeout(renderNextFrame, 1000 / 60);
    } else {
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 100);
    }
  }

  renderNextFrame();
}
