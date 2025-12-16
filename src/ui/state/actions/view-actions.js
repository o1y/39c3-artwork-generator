import { settings } from '../../../config/settings.js';
import { getNormalizedTime } from '../../../animation/timing.js';
import { preferences } from '../../../config/preferences.js';

export function createViewActions() {
  return {
    dismissHint(hint) {
      if (hint === 'toolbar') {
        this.toolbarHintDismissed = true;
        preferences.set('dismissedHints.toolbar', true);
      } else if (hint === 'spotlight') {
        this.spotlightHintDismissed = true;
        preferences.set('dismissedHints.spotlight', true);
      }
    },
    toggleExportAdvanced() {
      this.exportAdvancedCollapsed = !this.exportAdvancedCollapsed;
    },
    toggleMobileHeader() {
      this.mobileHeaderCollapsed = !this.mobileHeaderCollapsed;
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    },
    toggleTypographyPopover() {
      this.typographyPopoverOpen = !this.typographyPopoverOpen;
      if (this.typographyPopoverOpen) {
        this.animationPopoverOpen = false;
        this.downloadPopoverOpen = false;
        this.glyphPopoverOpen = false;
      }
    },
    closeTypographyPopover() {
      this.typographyPopoverOpen = false;
    },
    toggleAnimationPopover() {
      this.animationPopoverOpen = !this.animationPopoverOpen;
      if (this.animationPopoverOpen) {
        this.typographyPopoverOpen = false;
        this.downloadPopoverOpen = false;
        this.glyphPopoverOpen = false;
      }
    },
    closeAnimationPopover() {
      this.animationPopoverOpen = false;
    },
    toggleDownloadPopover() {
      this.downloadPopoverOpen = !this.downloadPopoverOpen;
      if (this.downloadPopoverOpen) {
        this.typographyPopoverOpen = false;
        this.animationPopoverOpen = false;
        this.glyphPopoverOpen = false;
      }
    },
    closeDownloadPopover() {
      this.downloadPopoverOpen = false;
    },
    toggleGlyphPopover() {
      this.glyphPopoverOpen = !this.glyphPopoverOpen;
      if (this.glyphPopoverOpen) {
        this.typographyPopoverOpen = false;
        this.animationPopoverOpen = false;
        this.downloadPopoverOpen = false;
        this.loadGlyphCategories();
      }
    },
    closeGlyphPopover() {
      this.glyphPopoverOpen = false;
    },
    appendToText(char) {
      if (this.text.length < 30) {
        this.text += char;
        this.isTextDirty = true;
      }
    },
    initFullscreenListener() {
      document.addEventListener('fullscreenchange', () => {
        this.isFullscreen = !!document.fullscreenElement;
      });
    },
    handleCanvasClick(event) {
      if (this.mode !== 'spotlight' || !this.showModeControl) return;

      const rect = event.target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      this.animationOriginX = Math.max(0, Math.min(1, x));
      this.animationOriginY = 1 - Math.max(0, Math.min(1, y));
      this.animationPhaseOffset = getNormalizedTime(settings.time) - Math.PI / 2;
    },
  };
}
