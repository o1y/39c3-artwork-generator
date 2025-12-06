import { settings } from '../../config/settings.js';

export function generateFilename(extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const theme = settings.theme;
  const mode = settings.mode;
  const color = settings.colorMode;
  return `39C3-${theme}-${mode}-${color}-${timestamp}.${extension}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCanvas(canvas, extension, filename, callback) {
  const mimeType = `image/${extension}`;

  canvas.toBlob((blob) => {
    downloadBlob(blob, filename);

    if (callback) {
      callback();
    }
  }, mimeType);
}
