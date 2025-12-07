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
  };
}
