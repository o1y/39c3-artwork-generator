import {
  loadGallery,
  saveToGallery,
  deleteFromGallery,
  getGalleryItem,
} from '../../../gallery/storage.js';
import { generateThumbnail } from '../../../gallery/thumbnail.js';
import { captureArtworkConfig, restoreArtworkConfig } from '../../../gallery/config.js';
import { startPreview, stopPreview, LIGHTBOX_FPS } from '../../../gallery/preview.js';
import { render, pauseAnimation, resumeAnimation, getIsPaused } from '../../../animation/loop.js';
import { getCongressDay } from '../../../config/congress.js';

let savedAnimationState = { gallery: false, lightbox: false };
let touchStart = { x: 0, y: 0 };
const SWIPE_THRESHOLD = 50;

function pauseAndSaveState(key) {
  savedAnimationState[key] = !getIsPaused();
  if (savedAnimationState[key]) {
    pauseAnimation();
  }
}

function restoreAnimationState(key) {
  if (savedAnimationState[key]) {
    resumeAnimation();
  }
}

function loadArtworkFromItem(store, item, options = {}) {
  if (!item || !item.config) return false;

  store.stopGalleryPreview();
  restoreArtworkConfig(item.config, store);
  store.isTextDirty = true;
  store.isColorModeDirty = true;
  store.galleryOpen = false;

  if (options.resumeAnimation) {
    resumeAnimation();
  } else if (options.respectPausedState) {
    if (item.config.isPaused) {
      pauseAnimation();
    } else {
      resumeAnimation();
    }
  }

  render();
  return true;
}

export function createGalleryActions() {
  return {
    toggleGallery() {
      this.galleryOpen = !this.galleryOpen;
      if (this.galleryOpen) {
        this.galleryItems = loadGallery();
        pauseAndSaveState('gallery');
      } else {
        this.stopGalleryPreview();
        restoreAnimationState('gallery');
      }
    },

    closeGallery() {
      this.galleryOpen = false;
      this.stopGalleryPreview();
      restoreAnimationState('gallery');
    },

    refreshGalleryItems() {
      this.galleryItems = loadGallery();
    },

    async saveCurrentToGallery() {
      const thumbnail = generateThumbnail();
      const config = captureArtworkConfig(this);
      const result = saveToGallery(config, thumbnail);
      if (result) {
        this.showToast('Saved!', 'save');
        this.refreshGalleryItems();
        this.galleryBadgeAnimating = true;
        setTimeout(() => {
          this.galleryBadgeAnimating = false;
        }, 600);
      } else {
        this.showToast('Full!', 'save');
      }
    },

    loadFromGallery(id) {
      const item = getGalleryItem(id);
      loadArtworkFromItem(this, item, { respectPausedState: true });
    },

    removeFromGallery(id) {
      deleteFromGallery(id);
      this.refreshGalleryItems();
    },

    startGalleryPreview(item, canvas) {
      if (!canvas || !item.config) return;

      const config = item.config;
      if (this.hoveredGalleryItem === item.id) return;

      this.hoveredGalleryItem = item.id;
      startPreview(canvas, config);
    },

    stopGalleryPreview() {
      if (this.hoveredGalleryItem) {
        stopPreview();
        this.hoveredGalleryItem = null;
      }
    },

    loadFromCommunity(item) {
      loadArtworkFromItem(this, item, { resumeAnimation: true });
    },

    openCommunityLightbox() {
      pauseAndSaveState('lightbox');
      this.lightboxOpen = true;
      this.lightboxIndex = 0;

      if (this.communityItems.length > 0) {
        this.$nextTick(() => {
          this.startLightboxAnimation();
        });
      }
    },

    openLightbox(index) {
      if (this.communityItems.length === 0) return;
      pauseAndSaveState('lightbox');
      this.lightboxIndex = index;
      this.lightboxOpen = true;
      this.$nextTick(() => {
        this.startLightboxAnimation();
      });
    },

    closeLightbox() {
      stopPreview();
      this.lightboxOpen = false;
      restoreAnimationState('lightbox');
    },

    lightboxNext() {
      if (this.communityItems.length === 0) return;
      if (this.lightboxIndex >= this.communityItems.length - 1) return;

      stopPreview();
      this.lightboxIndex++;
      this.$nextTick(() => this.startLightboxAnimation());
    },

    lightboxPrev() {
      if (this.communityItems.length === 0) return;
      if (this.lightboxIndex === 0) return;

      stopPreview();
      this.lightboxIndex--;
      this.$nextTick(() => this.startLightboxAnimation());
    },

    startLightboxAnimation() {
      const canvas = this.$refs.lightboxCanvas;
      if (!canvas) return;

      const item = this.communityItems[this.lightboxIndex];
      if (!item || !item.config) return;

      canvas.width = 1000;
      canvas.height = 1000;
      startPreview(canvas, item.config, LIGHTBOX_FPS);
    },

    forkLightboxItem() {
      const item = this.communityItems[this.lightboxIndex];
      if (item) {
        this.closeLightbox();
        this.closeGallery();
        this.loadFromCommunity(item);
      }
    },

    get currentLightboxItem() {
      return this.communityItems[this.lightboxIndex] || null;
    },

    get currentLightboxDay() {
      const item = this.communityItems[this.lightboxIndex];
      if (!item || !item.createdAt) return null;
      return getCongressDay(item.createdAt);
    },

    handleLightboxTouchStart(event) {
      const touch = event.touches[0];
      touchStart.x = touch.clientX;
      touchStart.y = touch.clientY;
    },

    handleLightboxTouchEnd(event) {
      if (this.communityItems.length === 0) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < 0) {
          this.lightboxNext();
        } else {
          this.lightboxPrev();
        }
      }
    },
  };
}
