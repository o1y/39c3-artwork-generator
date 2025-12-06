export const BRAND_COLORS = {
  green: [
    '#009900', // 900
    '#00d300', // 700
    '#00ea00', // 600
    '#00ff00', // 400 - Primary
    '#a3ff90', // 200
    '#ccffbe', // 100
    '#ebffe5', // 50
  ],
  violet: [
    '#4d2eed', // 600
    '#5c33f4', // 500
    '#7952fe', // 400
    '#9673ff', // 300 - Secondary
    '#b69dfe', // 200
    '#d4c4fe', // 100
    '#efe7ff', // 50
  ],
  natural: '#faf5f5',
  dark: '#141414',
};

export const COLOR_MODES = {
  mono: {
    label: 'Natural + Dark',
    themeClass: 'theme-violet',
    foreground: 'natural',
    background: 'dark',
  },
  'mono-inv': {
    label: 'Dark + Natural',
    themeClass: 'theme-violet',
    foreground: 'dark',
    background: 'natural',
  },
  green: {
    label: 'Green + Dark',
    themeClass: 'theme-green',
    palette: 'green',
    staticIndex: 3,
    background: 'dark',
    smooth: false,
  },
  'green-smooth': {
    label: 'Green Smooth + Dark',
    themeClass: 'theme-green',
    palette: 'green',
    staticIndex: 3,
    background: 'dark',
    smooth: true,
  },
  'green-inv': {
    label: 'Dark + Green',
    themeClass: 'theme-green',
    foreground: 'dark',
    background: { palette: 'green', index: 3 },
  },
  violet: {
    label: 'Violet + Dark',
    themeClass: 'theme-violet',
    palette: 'violet',
    staticIndex: 2,
    background: 'dark',
    smooth: false,
  },
  'violet-smooth': {
    label: 'Violet Smooth + Dark',
    themeClass: 'theme-violet',
    palette: 'violet',
    staticIndex: 2,
    background: 'dark',
    smooth: true,
  },
  'violet-inv': {
    label: 'Dark + Violet',
    themeClass: 'theme-violet',
    foreground: 'dark',
    background: { palette: 'violet', index: 3 },
  },
};

export const COLOR_MODE_OPTIONS = Object.entries(COLOR_MODES).map(([value, config]) => ({
  value,
  label: config.label,
}));

export const THEME_COLOR_CLASS_MAP = Object.fromEntries(
  Object.entries(COLOR_MODES).map(([key, config]) => [key, config.themeClass])
);
