import { settings } from '../../config/settings.js';

export function captureSettingsState() {
  return {
    canvasSize: settings.canvasSize,
    margin: settings.margin,
    time: settings.time,
    animationSpeed: settings.animationSpeed,
  };
}

export function restoreSettingsState(state) {
  settings.canvasSize = state.canvasSize;
  settings.margin = state.margin;
  settings.time = state.time;
  settings.animationSpeed = state.animationSpeed;
}

export function applyScaledSettings(scaledSize, scaleFactor) {
  settings.canvasSize = scaledSize;
  settings.margin = settings.margin * scaleFactor;
}

export function resetAnimationTime(animationSpeed) {
  settings.time = 0;
  settings.animationSpeed = animationSpeed;
}
