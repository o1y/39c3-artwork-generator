export function createViewActions() {
  return {
    toggleExportAdvanced() {
      this.exportAdvancedCollapsed = !this.exportAdvancedCollapsed;
    },
    toggleMobileHeader() {
      this.mobileHeaderCollapsed = !this.mobileHeaderCollapsed;
    },
  };
}
