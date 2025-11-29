import { settings, defaultTexts, themePresets } from '../config/settings.js';
import { exportPNG } from '../export/png.js';
import { exportSVG } from '../export/svg.js';
import { exportVideo } from '../export/video/index.js';

export function createAppStore() {
  return {
    // UI State
    isTextDirty: false,
    exportSectionCollapsed: true,
    isExporting: false,
    exportProgress: 0,

    // Browser detection
    get isChrome() {
      return /Chrome/.test(navigator.userAgent) && !/Edg|Firefox/.test(navigator.userAgent);
    },

    get exportStatusLabel() {
      if (!this.isExporting) return '';
      if (this.exportFormat === 'video') {
        if (this.isChrome) {
          return 'Rendering (grab a coffee ☕)';
        }
        return 'Rendering';
      }
      return 'Exporting';
    },

    // Application Settings
    text: settings.text,
    theme: settings.theme,
    colorMode: settings.colorMode,
    numLines: settings.numLines,
    animationSpeed: settings.animationSpeed,
    mode: settings.mode,
    exportFormat: 'png',
    exportResolution: '2',
    exportDuration: '5',

    get currentPreset() {
      return themePresets[this.theme] || {};
    },

    get capabilities() {
      return this.currentPreset.capabilities || { animated: true, variableWeight: true };
    },

    get controls() {
      return this.currentPreset.controls || { showLines: true, showWidth: false, showMode: true };
    },

    get isAnimated() {
      return this.capabilities.animated !== false;
    },

    get showSpeedControl() {
      return this.isAnimated;
    },

    get showLinesControl() {
      return this.controls.showLines;
    },

    get showWidthControl() {
      return this.controls.showWidth;
    },

    get showModeControl() {
      return this.controls.showMode;
    },

    get showDurationControl() {
      return this.exportFormat === 'video';
    },

    get showResolutionControl() {
      return this.exportFormat !== 'svg';
    },

    get videoExportDisabled() {
      return !this.isAnimated;
    },

    get speedDisplay() {
      return this.animationSpeed.toFixed(1) + 'x';
    },

    get linesDisplay() {
      return this.numLines.toString();
    },

    get downloadButtonText() {
      if (!this.isExporting) {
        return 'Download';
      }
      return `${this.exportStatusLabel}... ${this.exportProgress}%`;
    },

    get bodyThemeClass() {
      const themeMap = {
        green: 'theme-green',
        'green-smooth': 'theme-green',
        'green-inv': 'theme-green',
        violet: 'theme-violet',
        'violet-smooth': 'theme-violet',
        'violet-inv': 'theme-violet',
        mono: 'theme-violet',
        'mono-inv': 'theme-violet',
      };
      return themeMap[this.colorMode] || 'theme-violet';
    },

    get availableResolutions() {
      return [
        { value: '1', label: '1x (1000px)' },
        { value: '2', label: '2x (2000px)' },
        { value: '4', label: '4x (4000px)' }
      ];
    },

    init() {
      // Apply initial capabilities from theme preset
      const initialPreset = themePresets[this.theme];
      if (initialPreset && initialPreset.capabilities) {
        settings.capabilities = { ...initialPreset.capabilities };
      }

      this.$watch('text', (value) => {
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          this.$nextTick(() => {
            this.text = upperValue;
          });
        }
        settings.text = upperValue;
      });

      this.$watch('theme', (value) => {
        this.onThemeChange(value);
      });

      this.$watch('colorMode', (value) => {
        settings.colorMode = value;
      });

      this.$watch('numLines', (value) => {
        settings.numLines = value;
      });

      this.$watch('animationSpeed', (value) => {
        settings.animationSpeed = value;
      });

      this.$watch('mode', (value) => {
        settings.mode = value;
      });
    },

    onThemeChange(newTheme) {
      settings.theme = newTheme;
      const preset = themePresets[newTheme];

      if (preset && preset.capabilities) {
        settings.capabilities = { ...preset.capabilities };
      }

      if (!this.isTextDirty && preset) {
        if (preset.colorMode) {
          this.colorMode = preset.colorMode;
        }

        if (preset.numLines) {
          this.numLines = preset.numLines;
        }

        if (preset.text) {
          this.text = preset.text;
        }

        // Restore default text when switching away from CCC preset text
        if (newTheme !== 'ccc' && this.text === defaultTexts.ccc) {
          this.text = defaultTexts.default;
        }
      }

      if (!this.isAnimated && this.exportFormat === 'video') {
        this.exportFormat = 'png';
      }
    },

    toggleExportSection() {
      this.exportSectionCollapsed = !this.exportSectionCollapsed;
    },

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
    }
  };
}
