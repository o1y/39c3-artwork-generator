import { exportPNG } from '../../../export/png.js';
import { exportSVG } from '../../../export/svg.js';
import { exportVideo } from '../../../export/video/index.js';

export function createExportActions() {
  return {
    handleDownload() {
      const resolution = parseInt(this.exportResolution);
      const duration = parseInt(this.exportDuration);

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
          }
        };
        exportVideo(duration, resolution, callbacks);
      }
    },
  };
}
