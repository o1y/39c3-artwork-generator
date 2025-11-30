export const defaultTexts = {
  default: '39C3 POWER CYCLES',
  ccc: '\uE002',
};

// Parse toggleVariant into position and style
export function parseToggleVariant(variant) {
  const parts = variant.split('-');
  return {
    position: parts[0], // 'left' or 'right'
    style: parts[1], // 'filled' or 'outlined'
  };
}

export const settings = {
  text: defaultTexts.default,
  numLines: 11,
  minWeight: 10,
  maxWeight: 100,
  widthValue: 76,
  canvasSize: 1000,
  margin: 50,
  lineSpacingFactor: 0.92,
  verticalOffset: 3,
  animationSpeed: 1.5,
  mode: 'wave',
  colorMode: 'violet-inv',
  theme: 'lines', // 'lines', 'toggle', 'toggle39c3Animated', 'toggle39c3Static', or 'ccc'
  toggleVariant: 'left-filled', // 'left-filled', 'left-outlined', 'right-filled', or 'right-outlined'
  time: 0,
  // Theme capabilities - controls which UI elements and features are available
  capabilities: {
    animated: true,
    variableWeight: true,
  },
};

// Theme presets
export const themePresets = {
  lines: {
    colorMode: 'violet-inv',
    numLines: 11,
    text: defaultTexts.default,
    capabilities: {
      animated: true,
      variableWeight: true,
    },
    controls: {
      showLines: true,
      showWidth: false,
      showMode: true,
      showToggleVariant: false,
    },
  },
  toggle: {
    colorMode: 'mono',
    text: defaultTexts.default,
    capabilities: {
      animated: true,
      variableWeight: true,
    },
    controls: {
      showLines: false,
      showMode: false,
      showToggleVariant: true,
    },
  },
  toggle39c3Animated: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    capabilities: {
      animated: true,
      variableWeight: false,
    },
    controls: {
      showLines: false,
      showWidth: false,
      showMode: false,
      showToggleVariant: true,
    },
  },
  toggle39c3Static: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    staticWeight: 80,
    capabilities: {
      animated: false,
      variableWeight: false,
    },
    controls: {
      showLines: false,
      showWidth: false,
      showMode: false,
      showToggleVariant: true,
      showSmoothColorModes: false,
    },
  },
  ccc: {
    colorMode: 'mono',
    numLines: 22,
    text: defaultTexts.ccc,
    capabilities: {
      animated: true,
      variableWeight: false,
    },
    controls: {
      showLines: true,
      showWidth: false,
      showMode: false,
      showToggleVariant: false,
    },
  },
};

// 39C3 Brand Colors (one color + dark rule)
export const colors = {
  // Neon Green tints (for UI variation)
  green: [
    '#009900', // 900
    '#00d300', // 700
    '#00ea00', // 600
    '#00ff00', // 400 - Primary
    '#a3ff90', // 200
    '#ccffbe', // 100
    '#ebffe5', // 50
  ],
  // Electric Violet tints (for UI variation)
  violet: [
    '#4d2eed', // 600
    '#5c33f4', // 500
    '#7952fe', // 400
    '#9673ff', // 300 - Secondary
    '#b69dfe', // 200
    '#d4c4fe', // 100
    '#efe7ff', // 50
  ],
  // Natural (monochrome)
  natural: '#faf5f5',
  // Muted Black (background)
  dark: '#141414',
};
