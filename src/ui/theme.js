const COLOR_THEMES = {
  green: 'theme-green',
  'green-inv': 'theme-green',
  violet: 'theme-violet',
  'violet-inv': 'theme-violet',
  mono: 'theme-violet',
  'mono-inv': 'theme-violet',
};

const THEME_CLASSES = ['theme-green', 'theme-violet'];

export function applyColorTheme(colorMode) {
  const themeClass = COLOR_THEMES[colorMode] ?? 'theme-violet';

  document.body.classList.remove(...THEME_CLASSES);
  document.body.classList.add(themeClass);
}
