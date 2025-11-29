import { exportVideoMediaRecorder } from './mediarecorder.js';
import { exportVideoWebMWriter } from './webm-writer.js';

export function exportVideo(durationSeconds = 5, resolution = 2, callbacks = {}) {
  const isChromium = /Chrome/.test(navigator.userAgent);

  if (isChromium) {
    exportVideoWebMWriter(durationSeconds, resolution, callbacks);
  } else {
    exportVideoMediaRecorder(durationSeconds, resolution, callbacks);
  }
}
