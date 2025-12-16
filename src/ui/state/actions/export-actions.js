import { exportPNG } from '../../../export/png.js';
import { exportSVG } from '../../../export/svg.js';
import { exportVideo } from '../../../export/video/index.js';
import { exportGIF } from '../../../export/gif.js';
import { KEY_MAP, DEFAULTS, isKeyRelevant } from '../../../config/url-keys.js';
import { settings } from '../../../config/settings.js';

const SHAREABLE_STATE_KEYS = Object.keys(KEY_MAP);

export function createExportActions() {
  return {
    async handleShare() {
      const params = new URLSearchParams();
      const currentTheme = this.theme ?? settings.theme;

      for (const key of SHAREABLE_STATE_KEYS) {
        if (!isKeyRelevant(key, currentTheme, this)) continue;

        let value = this[key] ?? settings[key];
        const defaultValue = DEFAULTS[key];

        if (value === defaultValue) continue;
        if (value === undefined || value === null) continue;

        if (
          key === 'animationOriginX' ||
          key === 'animationOriginY' ||
          key === 'animationPhaseOffset'
        ) {
          value = Math.round(value * 10000) / 10000;
          if (value === defaultValue) continue;
        }

        const shortKey = KEY_MAP[key];
        if (typeof value === 'boolean') {
          params.set(shortKey, value ? '1' : '0');
        } else {
          params.set(shortKey, String(value));
        }
      }

      const queryString = params.toString();
      const url = queryString
        ? `${window.location.origin}${window.location.pathname}?${queryString}`
        : `${window.location.origin}${window.location.pathname}`;

      try {
        await navigator.clipboard.writeText(url);
        this.shareButtonText = 'Copied!';
        setTimeout(() => {
          this.shareButtonText = null;
        }, 2000);
      } catch {
        window.prompt('Copy this link to share:', url);
      }
    },

    handleDownload() {
      const resolution = parseInt(this.exportResolution);
      const loops = parseInt(this.exportLoops);

      if (this.exportFormat === 'png') {
        exportPNG(resolution);
      } else if (this.exportFormat === 'svg') {
        exportSVG();
      } else if (this.exportFormat === 'video') {
        const callbacks = {
          onStart: () => {
            this.isExporting = true;
            this.exportProgress = 0;
          },
          onProgress: (progress) => {
            this.exportProgress = progress;
          },
          onComplete: () => {
            this.isExporting = false;
            this.exportProgress = 0;
          },
        };
        exportVideo(loops, this.animationSpeed, resolution, callbacks);
      } else if (this.exportFormat === 'gif') {
        const callbacks = {
          onStart: () => {
            this.isExporting = true;
            this.exportProgress = 0;
          },
          onProgress: (progress) => {
            this.exportProgress = progress;
          },
          onComplete: () => {
            this.isExporting = false;
            this.exportProgress = 0;
          },
        };
        // For GIF, resolution is in pixels (500, 1000, 2000), not a multiplier
        exportGIF(loops, this.animationSpeed, resolution, callbacks);
      }
    },
  };
}
