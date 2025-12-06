const DEFAULT_MIN_WEIGHT = 10;
const DEFAULT_MAX_WEIGHT = 100;
const DEFAULT_CANVAS_SIZE = 1000;
const DEFAULT_MARGIN = 50;
const DEFAULT_LINE_SPACING_FACTOR = 0.92;
const DEFAULT_WIDTH_VALUE = 100;
const DEFAULT_ANIMATION_SPEED = 1.0;

const DEFAULT_CONTROLS = {
  showLines: false,
  showWidth: false,
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
  lineSpacingFactor: DEFAULT_LINE_SPACING_FACTOR,
  canvasSize: DEFAULT_CANVAS_SIZE,
  margin: DEFAULT_MARGIN,
  time: 0,
  animationSpeed: DEFAULT_ANIMATION_SPEED,
  mode: 'wave',
  theme: 'lines',
  toggleVariant: 'left-filled',
  colorMode: 'violet-inv',
};

export const themePresets = {
  lines: {
    colorMode: 'violet-inv',
    numLines: 11,
    text: defaultTexts.default,
    capabilities: DEFAULT_CAPABILITIES,
    controls: {
      ...DEFAULT_CONTROLS,
      showLines: true,
      showWidth: true,
      showMode: true,
    },
  },
  toggle: {
    colorMode: 'mono',
    text: defaultTexts.default,
    layout: 'single-row',
    capabilities: DEFAULT_CAPABILITIES,
    controls: {
      ...DEFAULT_CONTROLS,
      showToggleVariant: true,
    },
  },
  toggle39c3Animated: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    layout: 'two-row',
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
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    layout: 'two-row',
    staticWeight: 80,
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
