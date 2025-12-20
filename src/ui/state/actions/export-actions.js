import { exportPNG } from '../../../export/png.js';
import { exportSVG } from '../../../export/svg.js';
import { exportVideo } from '../../../export/video/index.js';
import { exportGIF } from '../../../export/gif.js';
import { exportFax } from '../../../export/fax.js';
import { KEY_MAP, DEFAULTS } from '../../../config/url-keys.js';
import { captureArtworkConfig } from '../../../gallery/config.js';

export function createExportActions() {
  return {
    async handleShare() {
      const config = captureArtworkConfig(this);
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(config)) {
        const defaultValue = DEFAULTS[key];
        if (value === defaultValue) continue;

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
        this.showToast('Copied Link', 'share');
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
      } else if (this.exportFormat === 'fax') {
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
        exportFax(1, callbacks); // Always use 1x for thermal paper effect
      }
    },
  };
}
