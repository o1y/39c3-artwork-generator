export function createViewActions() {
  return {
    toggleExportSection() {
      this.exportSectionCollapsed = !this.exportSectionCollapsed;
    },
  };
}
