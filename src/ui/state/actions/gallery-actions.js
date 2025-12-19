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
import {
  fetchGalleryItems,
  submitToGallery,
  deleteGalleryItem,
  isDevMode,
} from '../../../api/community.js';

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

function updateCommunityPagination(store, response, append = false) {
  if (append) {
    store.communityItems = [...store.communityItems, ...response.items];
    store.communityOffset += response.items.length;
  } else {
    store.communityItems = response.items;
    store.communityOffset = response.items.length;
  }
  store.communityTotal = response.total;
  store.communityHasMore = store.communityOffset < response.total;
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

    openCommunityConsent() {
      this.showCommunityConsent = true;
    },

    closeCommunityConsent() {
      this.showCommunityConsent = false;
    },

    async submitToCommunity() {
      if (this.communitySubmitting) return;

      this.communitySubmitting = true;
      this.showCommunityConsent = false;

      try {
        const config = captureArtworkConfig(this);
        await submitToGallery(config);
        this.showToast('Shared!', 'save', { variant: 'community' });
        this.communityItems = [];
        this.communityOffset = 0;
        this.communityHasMore = true;
      } catch (error) {
        this.showToast(
          error.message.includes('wait') ? 'Easy, Picasso!<br />Rate limit hit.' : 'Error!',
          'save',
          {
            variant: 'community',
          }
        );
        console.error('Failed to submit to community:', error);
      } finally {
        this.communitySubmitting = false;
      }
    },

    async openCommunityLightbox() {
      pauseAndSaveState('lightbox');
      this.lightboxOpen = true;
      this.lightboxIndex = 0;

      if (this.communityItems.length === 0 && !this.communityLoading) {
        this.communityLoading = true;
        this.communityError = null;
        this.communityOffset = 0;
        this.communityHasMore = true;

        try {
          const response = await fetchGalleryItems({ limit: 50, offset: 0 });
          updateCommunityPagination(this, response, false);
        } catch (error) {
          this.communityError = error.message;
          console.error('Failed to load community gallery:', error);
          this.communityLoading = false;
          return;
        }

        this.communityLoading = false;
      }

      if (this.communityItems.length > 0) {
        this.$nextTick(() => {
          this.startLightboxAnimation();
        });
      }
    },

    async loadMoreCommunityItems() {
      if (this.communityLoadingMore || !this.communityHasMore) return;

      this.communityLoadingMore = true;

      try {
        const response = await fetchGalleryItems({
          limit: 50,
          offset: this.communityOffset,
        });
        updateCommunityPagination(this, response, true);
      } catch (error) {
        console.error('Failed to load more community items:', error);
      } finally {
        this.communityLoadingMore = false;
      }
    },

    checkLoadMore() {
      if (this.lightboxIndex >= this.communityItems.length - 5 && this.communityHasMore) {
        this.loadMoreCommunityItems();
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

    async lightboxNext() {
      if (this.communityItems.length === 0) return;

      const nextIndex = this.lightboxIndex + 1;
      const isAtEnd = nextIndex >= this.communityItems.length;

      if (isAtEnd) {
        if (!this.communityHasMore) {
          return;
        }

        if (!this.communityLoadingMore) {
          await this.loadMoreCommunityItems();
        }

        if (nextIndex < this.communityItems.length) {
          stopPreview();
          this.lightboxIndex = nextIndex;
          this.$nextTick(() => this.startLightboxAnimation());
        }
        return;
      }

      stopPreview();
      this.lightboxIndex = nextIndex;
      this.$nextTick(() => this.startLightboxAnimation());
      this.checkLoadMore();
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

    async deleteLightboxItem() {
      const item = this.communityItems[this.lightboxIndex];
      if (!item) return;

      try {
        await deleteGalleryItem(item.id);

        this.communityItems = this.communityItems.filter((i) => i.id !== item.id);
        this.communityTotal--;

        if (this.lightboxIndex >= this.communityItems.length) {
          this.lightboxIndex = Math.max(0, this.communityItems.length - 1);
        }

        if (this.communityItems.length === 0) {
          this.closeLightbox();
        } else {
          this.$nextTick(() => {
            this.startLightboxAnimation();
          });
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert(error.message);
      }
    },

    get currentLightboxItem() {
      return this.communityItems[this.lightboxIndex] || null;
    },

    get isDevMode() {
      return isDevMode();
    },

    handleLightboxTouchStart(event) {
      const touch = event.touches[0];
      touchStart.x = touch.clientX;
      touchStart.y = touch.clientY;
    },

    handleLightboxTouchEnd(event) {
      if (this.communityLoading || this.communityItems.length === 0) return;

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
