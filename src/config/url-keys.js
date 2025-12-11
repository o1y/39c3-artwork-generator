import { settings, themePresets } from './settings.js';

export const KEY_MAP = {
  text: 't',
  theme: 'th',
  toggleVariant: 'tv',
  colorMode: 'cm',
  numLines: 'nl',
  widthValue: 'w',
  opszValue: 'os',
  minWeight: 'mn',
  maxWeight: 'mx',
  staticWeight: 'sw',
  animationSpeed: 'as',
  mode: 'm',
  animationOriginX: 'ox',
  animationOriginY: 'oy',
  animationPhaseOffset: 'op',
  currentFrame: 'f',
  isPaused: 'p',
};

export const DEFAULTS = Object.fromEntries(
  Object.keys(KEY_MAP).map((key) => [key, settings[key] ?? (key === 'isPaused' ? false : 0)])
);

const KEY_RELEVANCE = {
  text: () => true,
  theme: () => true,
  colorMode: () => true,

  mode: (t) => t.capabilities.animated,
  animationSpeed: (t) => t.capabilities.animated,
  isPaused: (t) => t.capabilities.animated,
  currentFrame: (t, s) => t.capabilities.animated && s.isPaused,
  minWeight: (t) => t.capabilities.variableWeight,
  maxWeight: (t) => t.capabilities.variableWeight,
  staticWeight: (t) => !t.capabilities.variableWeight,

  numLines: (t) => t.controls.showLines,
  widthValue: (t) => t.controls.showWidth,
  opszValue: (t) => t.controls.showOpsz,
  toggleVariant: (t) => t.controls.showToggleVariant,

  animationOriginX: (t, s) => t.capabilities.animated && s.mode === 'spotlight',
  animationOriginY: (t, s) => t.capabilities.animated && s.mode === 'spotlight',
  animationPhaseOffset: (t, s) => t.capabilities.animated && s.mode === 'spotlight',
};

export function isKeyRelevant(key, themeName, state) {
  const check = KEY_RELEVANCE[key];
  if (!check) return true;
  const theme = themePresets[themeName];
  if (!theme) return true;
  return check(theme, state);
}
