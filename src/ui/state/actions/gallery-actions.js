import {
  loadGallery,
  saveToGallery,
  deleteFromGallery,
  getGalleryItem,
} from '../../../gallery/storage.js';
import { generateThumbnail } from '../../../gallery/thumbnail.js';
import { captureArtworkConfig, restoreArtworkConfig } from '../../../gallery/config.js';
import { startPreview, stopPreview } from '../../../gallery/preview.js';
import { render, pauseAnimation, resumeAnimation, getIsPaused } from '../../../animation/loop.js';

let wasAnimatingBeforeGallery = false;

export function createGalleryActions() {
  return {
    toggleShareMenu() {
      this.shareMenuOpen = !this.shareMenuOpen;
      if (this.shareMenuOpen) {
        this.galleryOpen = false;
      }
    },

    closeShareMenu() {
      this.shareMenuOpen = false;
    },

    toggleGallery() {
      this.galleryOpen = !this.galleryOpen;
      if (this.galleryOpen) {
        this.shareMenuOpen = false;
        this.galleryItems = loadGallery();
        wasAnimatingBeforeGallery = !getIsPaused();
        if (wasAnimatingBeforeGallery) {
          pauseAnimation();
        }
      } else {
        this.stopGalleryPreview();
        if (wasAnimatingBeforeGallery) {
          resumeAnimation();
        }
      }
    },

    closeGallery() {
      this.galleryOpen = false;
      this.stopGalleryPreview();
      if (wasAnimatingBeforeGallery) {
        resumeAnimation();
      }
    },

    refreshGalleryItems() {
      this.galleryItems = loadGallery();
    },

    async saveCurrentToGallery() {
      this.closeShareMenu();

      const thumbnail = generateThumbnail();
      const config = captureArtworkConfig(this);
      const result = saveToGallery(config, thumbnail);
      if (result) {
        this.gallerySaveText = 'Saved!';
        setTimeout(() => {
          this.gallerySaveText = null;
        }, 2000);
      } else {
        this.gallerySaveText = 'Full!';
        setTimeout(() => {
          this.gallerySaveText = null;
        }, 2000);
      }
    },

    loadFromGallery(id) {
      const item = getGalleryItem(id);
      if (item && item.config) {
        this.stopGalleryPreview();
        restoreArtworkConfig(item.config, this);
        this.isTextDirty = true;
        this.isColorModeDirty = true;
        this.galleryOpen = false;
        this.stopGalleryPreview();
        const shouldPause = item.config.isPaused ?? false;
        if (shouldPause) {
          pauseAnimation();
        } else {
          resumeAnimation();
        }
        render();
      }
    },

    removeFromGallery(id) {
      deleteFromGallery(id);
      this.refreshGalleryItems();
    },

    startGalleryPreview(item, canvas) {
      if (!canvas || !item.config) {
        return;
      }

      // Check if theme supports animation
      const config = item.config;
      if (this.hoveredGalleryItem === item.id) {
        return;
      }

      this.hoveredGalleryItem = item.id;
      startPreview(canvas, config);
    },

    stopGalleryPreview() {
      if (this.hoveredGalleryItem) {
        stopPreview();
        this.hoveredGalleryItem = null;
      }
    },
  };
}
