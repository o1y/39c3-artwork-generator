import { exportVideoMediaRecorder } from './mediarecorder.js';
import { exportVideoWebMWriter } from './webm-writer.js';

export function exportVideo(loops = 1, animationSpeed = 1.5, resolution = 2, callbacks = {}) {
  const isChromium = /Chrome/.test(navigator.userAgent);

  if (isChromium) {
    exportVideoWebMWriter(loops, animationSpeed, resolution, callbacks);
  } else {
    exportVideoMediaRecorder(loops, animationSpeed, resolution, callbacks);
  }
}
