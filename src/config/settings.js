export const defaultTexts = {
  default: '39C3 POWER CYCLES',
  ccc: '\uE002',
};

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
  theme: 'lines', // 'lines', 'toggleFilled', 'toggleOutlined', 'toggle39c3AnimatedFilled', 'toggle39c3AnimatedOutlined', 'toggle39c3StaticFilled', 'toggle39c3StaticOutlined', or 'ccc'
  time: 0,
  // Theme capabilities - controls which UI elements and features are available
  capabilities: {
    animated: true,
    variableWeight: true
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
    },
  },
  toggleFilled: {
    colorMode: 'mono',
    text: defaultTexts.default,
    pillStyle: 'filled',
    capabilities: {
      animated: true,
      variableWeight: true,
    },
    controls: {
      showLines: false,
      showWidth: true,
      showMode: false,
    },
  },
  toggleOutlined: {
    colorMode: 'mono',
    text: defaultTexts.default,
    pillStyle: 'outlined',
    capabilities: {
      animated: true,
      variableWeight: true,
    },
    controls: {
      showLines: false,
      showWidth: true,
      showMode: false,
    },
  },
  toggle39c3AnimatedFilled: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    pillStyle: 'filled',
    capabilities: {
      animated: true,
      variableWeight: false,
    },
    controls: {
      showLines: false,
      showWidth: false,
      showMode: false,
    },
  },
  toggle39c3AnimatedOutlined: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    pillStyle: 'outlined',
    capabilities: {
      animated: true,
      variableWeight: false,
    },
    controls: {
      showLines: false,
      showWidth: false,
      showMode: false,
    },
  },
  toggle39c3StaticFilled: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    staticWeight: 80,
    pillStyle: 'filled',
    capabilities: {
      animated: false,
      variableWeight: false,
    },
    controls: {
      showLines: false,
      showWidth: false,
      showMode: false,
    },
  },
  toggle39c3StaticOutlined: {
    colorMode: 'mono-inv',
    text: 'POWER CYCLES',
    staticWeight: 80,
    pillStyle: 'outlined',
    capabilities: {
      animated: false,
      variableWeight: false,
    },
    controls: {
      showLines: false,
      showWidth: false,
      showMode: false,
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
