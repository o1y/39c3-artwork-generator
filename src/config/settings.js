import { renderToggleTheme } from '../rendering/themes/toggle.js';
import { renderLinesTheme } from '../rendering/themes/lines.js';
import { renderCCCTheme } from '../rendering/themes/ccc.js';
import { renderTerminalTheme } from '../rendering/themes/terminal.js';
import { renderDVDTheme } from '../rendering/themes/dvd.js';

const DEFAULT_MIN_WEIGHT = 10;
const DEFAULT_MAX_WEIGHT = 100;
const DEFAULT_CANVAS_SIZE = 1000;
const DEFAULT_MARGIN = 50;
const DEFAULT_LINE_SPACING_FACTOR = 0.92;
const DEFAULT_WIDTH_VALUE = 100;
const DEFAULT_OPSZ_VALUE = 14;
const DEFAULT_ANIMATION_SPEED = 1.0;

const DEFAULT_CONTROLS = {
  showLines: false,
  showWidth: false,
  showOpsz: false,
  showMode: false,
  showToggleVariant: false,
  showSmoothColorModes: true,
};

const DEFAULT_CAPABILITIES = {
  animated: true,
  variableWeight: true,
};

export const defaultTexts = {
  default: '39C3 POWER CYCLES',
  ccc: '\uE002',
};

export const settings = {
  text: defaultTexts.default,
  numLines: 11,
  minWeight: DEFAULT_MIN_WEIGHT,
  maxWeight: DEFAULT_MAX_WEIGHT,
  widthValue: DEFAULT_WIDTH_VALUE,
  opszValue: DEFAULT_OPSZ_VALUE,
  lineSpacingFactor: DEFAULT_LINE_SPACING_FACTOR,
  canvasSize: DEFAULT_CANVAS_SIZE,
  margin: DEFAULT_MARGIN,
  time: 0,
  animationSpeed: DEFAULT_ANIMATION_SPEED,
  mode: 'wave',
  theme: 'lines',
  toggleVariant: 'left-filled',
  colorMode: 'violet-inv',
  animationOriginX: 1,
  animationOriginY: 1,
  animationPhaseOffset: 0,
};

export const themePresets = {
  lines: {
    renderer: renderLinesTheme,
    colorMode: 'violet-inv',
    numLines: 11,
    text: defaultTexts.default,
    forceUppercase: false,
    capabilities: DEFAULT_CAPABILITIES,
    controls: {
      ...DEFAULT_CONTROLS,
      showLines: true,
      showWidth: true,
      showOpsz: true,
      showMode: true,
      showMinWeight: true,
      showMaxWeight: true,
    },
  },
  toggle: {
    renderer: renderToggleTheme,
    colorMode: 'mono',
    text: defaultTexts.default,
    layout: 'single-row',
    forceUppercase: false,
    capabilities: DEFAULT_CAPABILITIES,
    controls: {
      ...DEFAULT_CONTROLS,
      showToggleVariant: true,
      showOpsz: true,
    },
  },
  toggle39c3Animated: {
    renderer: renderToggleTheme,
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    layout: 'two-row',
    forceUppercase: false,
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      variableWeight: false,
    },
    controls: {
      ...DEFAULT_CONTROLS,
      showToggleVariant: true,
    },
  },
  toggle39c3Static: {
    renderer: renderToggleTheme,
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    layout: 'two-row',
    staticWeight: 80,
    forceUppercase: false,
    capabilities: {
      animated: false,
      variableWeight: false,
    },
    controls: {
      ...DEFAULT_CONTROLS,
      showToggleVariant: true,
      showSmoothColorModes: false,
    },
  },
  ccc: {
    renderer: renderCCCTheme,
    colorMode: 'mono',
    numLines: 22,
    text: defaultTexts.ccc,
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      variableWeight: false,
    },
    controls: {
      ...DEFAULT_CONTROLS,
      showLines: true,
    },
  },
  terminal: {
    renderer: renderTerminalTheme,
    colorMode: 'green',
    numLines: 7,
    text: 'POWER CYCLES',
    capabilities: DEFAULT_CAPABILITIES,
    controls: {
      ...DEFAULT_CONTROLS,
      showLines: true,
    },
  },
  dvd: {
    renderer: renderDVDTheme,
    colorMode: 'mono',
    text: '\uE002',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      variableWeight: false,
    },
    controls: {
      ...DEFAULT_CONTROLS,
      showColorMode: false,
      showAnimationSpeed: false,
      showTextInput: false,
      showPlayControls: false,
      showExport: false,
    },
  },
};
