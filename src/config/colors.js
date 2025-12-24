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

const { green, violet, natural, dark } = BRAND_COLORS;

export const COLOR_MODES = {
  mono: {
    label: 'Dark',
    themeClass: 'theme-violet',
    foreground: 'natural',
    background: 'dark',
    preview: { fg: natural, bg: dark },
  },
  'mono-inv': {
    label: 'Light',
    themeClass: 'theme-violet',
    foreground: 'dark',
    background: 'natural',
    preview: { fg: dark, bg: natural },
  },
  'green-solid': {
    label: 'Green',
    themeClass: 'theme-green',
    foreground: { palette: 'green', index: 3 },
    background: 'dark',
    preview: { fg: green[3], bg: dark },
  },
  green: {
    label: 'Green Shades',
    themeClass: 'theme-green',
    palette: 'green',
    staticIndex: 3,
    background: 'dark',
    smooth: false,
    preview: { fg: [green[0], green[3], green[6]], bg: dark },
  },
  'green-smooth': {
    label: 'Green Smooth',
    themeClass: 'theme-green',
    palette: 'green',
    staticIndex: 3,
    background: 'dark',
    smooth: true,
    preview: { fg: [green[0], green[3], green[6]], bg: dark },
  },
  'green-inv': {
    label: 'Green Bg',
    themeClass: 'theme-green',
    foreground: 'dark',
    background: { palette: 'green', index: 3 },
    preview: { fg: dark, bg: green[3] },
  },
  'violet-solid': {
    label: 'Violet',
    themeClass: 'theme-violet',
    foreground: { palette: 'violet', index: 3 },
    background: 'dark',
    preview: { fg: violet[3], bg: dark },
  },
  violet: {
    label: 'Violet Shades',
    themeClass: 'theme-violet',
    palette: 'violet',
    staticIndex: 2,
    background: 'dark',
    smooth: false,
    preview: { fg: [violet[0], violet[3], violet[6]], bg: dark },
  },
  'violet-smooth': {
    label: 'Violet Smooth',
    themeClass: 'theme-violet',
    palette: 'violet',
    staticIndex: 2,
    background: 'dark',
    smooth: true,
    preview: { fg: [violet[0], violet[3], violet[6]], bg: dark },
  },
  'violet-inv': {
    label: 'Violet Bg',
    themeClass: 'theme-violet',
    foreground: 'dark',
    background: { palette: 'violet', index: 3 },
    preview: { fg: dark, bg: violet[3] },
  },
};

export const COLOR_MODE_OPTIONS = Object.entries(COLOR_MODES).map(([value, config]) => ({
  value,
  label: config.label,
  preview: config.preview,
}));

export const THEME_COLOR_CLASS_MAP = Object.fromEntries(
  Object.entries(COLOR_MODES).map(([key, config]) => [key, config.themeClass])
);
