import { settings } from '../config/settings.js';

// Generate filename with timestamp and settings
export function generateFilename(extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const theme = settings.theme;
  const mode = settings.mode;
  const color = settings.colorMode;
  return `39C3-${theme}-${mode}-${color}-${timestamp}.${extension}`;
}
