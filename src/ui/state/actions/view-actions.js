import { settings } from '../../../config/settings.js';
import { getNormalizedTime } from '../../../animation/timing.js';
import { preferences } from '../../../config/preferences.js';

/**
 * Creates popover toggle/close methods with mutual exclusion
 * @param {string[]} popoverNames - List of popover names (e.g., ['typography', 'animation'])
 * @param {Object} options - Additional options per popover
 * @returns {Object} Object containing toggle and close methods for each popover
 */
function createPopoverActions(popoverNames, options = {}) {
  const actions = {};

  for (const name of popoverNames) {
    const propName = `${name}PopoverOpen`;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    actions[`toggle${capitalizedName}Popover`] = function () {
      this[propName] = !this[propName];
      if (this[propName]) {
        for (const otherName of popoverNames) {
          if (otherName !== name) {
            this[`${otherName}PopoverOpen`] = false;
          }
        }
        if (options[name]?.onOpen) {
          options[name].onOpen.call(this);
        }
      }
    };

    // Close method
    actions[`close${capitalizedName}Popover`] = function () {
      this[propName] = false;
    };
  }

  return actions;
}

const popoverActions = createPopoverActions(
  ['typography', 'animation', 'download', 'save', 'glyph'],
  {
    glyph: {
      onOpen() {
        this.loadGlyphCategories();
      },
    },
  }
);

export function createViewActions() {
  return {
    ...popoverActions,

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
    appendToText(char) {
      if (this.text.length < this.maxTextLength) {
        this.text += char;
        this.isTextDirty = true;
      }
    },
    resizeTextarea(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 300) + 'px';
    },
    onTextareaFocus(el) {
      el.classList.add('expanded');
      this.$nextTick(() => this.resizeTextarea(el));
    },
    onTextareaBlur(el) {
      el.classList.remove('expanded');
      if (!el.matches(':hover')) {
        el.style.height = '40px';
      }
    },
    onTextareaMouseenter(el) {
      this.$nextTick(() => this.resizeTextarea(el));
    },
    onTextareaMouseleave(el) {
      if (document.activeElement !== el) {
        el.style.height = '40px';
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
    showToast(message, target, { duration = 2000, variant = 'default' } = {}) {
      this.toastMessage = message;
      this.toastTarget = target;
      this.toastVariant = variant;
      setTimeout(() => {
        this.toastMessage = null;
        this.toastTarget = null;
        this.toastVariant = 'default';
      }, duration);
    },
  };
}
