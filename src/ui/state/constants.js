export const ANIMATION_FPS = 30;
export const ANIMATION_CYCLE_SECONDS = 5; // Shorter loop duration
export const TOTAL_FRAMES = ANIMATION_FPS * ANIMATION_CYCLE_SECONDS;
export const MAX_EXPORT_FRAMES = 500; // Maximum frames for video export

export const THEME_COLOR_CLASS_MAP = {
  green: 'theme-green',
  'green-smooth': 'theme-green',
  'green-inv': 'theme-green',
  violet: 'theme-violet',
  'violet-smooth': 'theme-violet',
  'violet-inv': 'theme-violet',
  mono: 'theme-violet',
  'mono-inv': 'theme-violet',
};

export const COLOR_MODE_OPTIONS = [
  { value: 'mono', label: 'Natural + Dark' },
  { value: 'mono-inv', label: 'Dark + Natural' },
  { value: 'green', label: 'Green + Dark' },
  { value: 'green-smooth', label: 'Green Smooth + Dark' },
  { value: 'green-inv', label: 'Dark + Green' },
  { value: 'violet', label: 'Violet + Dark' },
  { value: 'violet-smooth', label: 'Violet Smooth + Dark' },
  { value: 'violet-inv', label: 'Dark + Violet' },
];

export const AVAILABLE_RESOLUTIONS = [
  { value: '1', label: '1x (1000px)' },
  { value: '2', label: '2x (2000px)' },
  { value: '4', label: '4x (4000px)' },
];

export const AVAILABLE_GIF_RESOLUTIONS = [
  { value: '500', label: '500px' },
  { value: '1000', label: '1000px' },
  { value: '2000', label: '2000px' },
];
