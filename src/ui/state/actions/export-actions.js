import { exportPNG } from '../../../export/png.js';
import { exportSVG } from '../../../export/svg.js';
import { exportVideo } from '../../../export/video/index.js';
import { exportGIF } from '../../../export/gif.js';

export function createExportActions() {
  return {
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
