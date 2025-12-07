import { settings } from '../../../config/settings.js';
import { getNormalizedTime } from '../../../animation/timing.js';

export function createViewActions() {
  return {
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
      if (this.typographyPopoverOpen) this.animationPopoverOpen = false;
    },
    closeTypographyPopover() {
      this.typographyPopoverOpen = false;
    },
    toggleAnimationPopover() {
      this.animationPopoverOpen = !this.animationPopoverOpen;
      if (this.animationPopoverOpen) this.typographyPopoverOpen = false;
    },
    closeAnimationPopover() {
      this.animationPopoverOpen = false;
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
      settings.animationPhaseOffset = getNormalizedTime(settings.time) - Math.PI / 2;
    },
  };
}
