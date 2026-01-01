import {
  settings,
  themePresets,
  FONT_AXES,
  VALID_MODES,
  VALID_TOGGLE_VARIANTS,
  MAX_TEXT_LENGTH,
  MAX_MULTILINE_TEXT_LENGTH,
} from '../../config/settings.js';
import { preferences } from '../../config/preferences.js';
import { COLOR_MODES } from '../../config/colors.js';
import { KEY_MAP } from '../../config/url-keys.js';
import { TOTAL_FRAMES } from './constants.js';
import { impressum } from '../../config/impressum.js';
import { galleryConfig } from '../../config/gallery.js';
import { loadGallery } from '../../gallery/storage.js';

const NUMERIC_BOUNDS = {
  numLines: [1, 100],
  widthValue: FONT_AXES.width,
  opszValue: FONT_AXES.opticalSize,
  minWeight: FONT_AXES.weight,
  maxWeight: FONT_AXES.weight,
  staticWeight: FONT_AXES.weight,
  togglePosition: [0, 1],
  animationSpeed: [0.1, 10],
  animationOriginX: [0, 1],
  animationOriginY: [0, 1],
  currentFrame: [0, TOTAL_FRAMES],
};

const SETTINGS_KEYS = [
  'text',
  'theme',
  'toggleVariant',
  'togglePosition',
  'colorMode',
  'mode',
  'numLines',
  'widthValue',
  'opszValue',
  'minWeight',
  'maxWeight',
  'staticWeight',
  'animationSpeed',
  'animationOriginX',
  'animationOriginY',
  'animationPhaseOffset',
];

const STRING_PARAMS = ['text', 'theme', 'toggleVariant', 'colorMode', 'mode'];
const BOOLEAN_PARAMS = ['isPaused'];
const NUMERIC_PARAMS = [
  'numLines',
  'widthValue',
  'opszValue',
  'minWeight',
  'maxWeight',
  'staticWeight',
  'togglePosition',
  'animationSpeed',
  'animationOriginX',
  'animationOriginY',
  'animationPhaseOffset',
  'currentFrame',
];

function getParam(params, key) {
  const shortKey = KEY_MAP[key];
  return params.has(shortKey) ? params.get(shortKey) : null;
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};

  for (const key of STRING_PARAMS) {
    const value = getParam(params, key);
    if (value !== null) {
      result[key] = value;
    }
  }

  for (const key of BOOLEAN_PARAMS) {
    const value = getParam(params, key);
    if (value !== null) {
      result[key] = value === 'true' || value === '1';
    }
  }

  for (const key of NUMERIC_PARAMS) {
    const value = getParam(params, key);
    if (value !== null) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const bounds = NUMERIC_BOUNDS[key];
        result[key] = bounds ? Math.max(bounds[0], Math.min(bounds[1], numValue)) : numValue;
      }
    }
  }

  if (result.theme && !themePresets[result.theme]) delete result.theme;

  // Validate text length based on theme's multiline capability
  const isMultiline = themePresets[result.theme]?.controls?.showMultilineInput === true;
  const maxTextLen = isMultiline ? MAX_MULTILINE_TEXT_LENGTH : MAX_TEXT_LENGTH;
  if (result.text && result.text.length > maxTextLen) {
    result.text = result.text.slice(0, maxTextLen);
  }
  if (result.mode && !VALID_MODES.includes(result.mode)) delete result.mode;
  if (result.colorMode && !COLOR_MODES[result.colorMode]) delete result.colorMode;
  if (result.toggleVariant && !VALID_TOGGLE_VARIANTS.includes(result.toggleVariant))
    delete result.toggleVariant;

  for (const key of SETTINGS_KEYS) {
    if (key in result) {
      settings[key] = result[key];
    }
  }

  if (result.theme) {
    const preset = themePresets[result.theme];
    if (preset?.capabilities) {
      settings.capabilities = { ...preset.capabilities };
    }
  }

  return result;
}

export function createInitialState() {
  const urlParams = getUrlParams();

  return {
    // View state
    isTextDirty: 'text' in urlParams,
    isColorModeDirty: 'colorMode' in urlParams,
    exportAdvancedCollapsed: true,
    mobileHeaderCollapsed: true,
    isFullscreen: false,
    typographyPopoverOpen: false,
    animationPopoverOpen: false,
    downloadPopoverOpen: false,
    savePopoverOpen: false,
    glyphPopoverOpen: false,
    colorPopoverOpen: false,
    isSliderDragging: false,
    spotlightHintDismissed:
      preferences.get('dismissedHints.spotlight') ||
      'animationOriginX' in urlParams ||
      'animationOriginY' in urlParams,
    toolbarHintDismissed: preferences.get('dismissedHints.toolbar'),

    // Toast notification state
    toastMessage: null,
    toastTarget: null,
    toastVariant: 'default',

    // Settings state (URL params override defaults)
    text: urlParams.text ?? settings.text,
    theme: urlParams.theme ?? settings.theme,
    toggleVariant: urlParams.toggleVariant ?? settings.toggleVariant,
    togglePosition: urlParams.togglePosition ?? settings.togglePosition,
    colorMode: urlParams.colorMode ?? settings.colorMode,
    numLines: urlParams.numLines ?? settings.numLines,
    widthValue: urlParams.widthValue ?? settings.widthValue,
    opszValue: urlParams.opszValue ?? settings.opszValue,
    minWeight: urlParams.minWeight ?? settings.minWeight,
    maxWeight: urlParams.maxWeight ?? settings.maxWeight,
    staticWeight: urlParams.staticWeight ?? settings.staticWeight,
    animationSpeed: urlParams.animationSpeed ?? settings.animationSpeed,
    mode: urlParams.mode ?? settings.mode,
    animationOriginX: urlParams.animationOriginX ?? settings.animationOriginX,
    animationOriginY: urlParams.animationOriginY ?? settings.animationOriginY,
    animationPhaseOffset: urlParams.animationPhaseOffset ?? settings.animationPhaseOffset,

    // Animation state
    isPaused: urlParams.isPaused ?? false,
    currentFrame: urlParams.currentFrame ?? 0,

    // Export state
    isExporting: false,
    exportProgress: 0,
    exportFormat: 'png',
    exportResolution: '2',
    exportLoops: '1',

    // Gallery state
    galleryOpen: false,
    galleryItems: loadGallery(),
    hoveredGalleryItem: null,
    galleryBadgeAnimating: false,

    // Impressum state
    impressumOpen: false,
    impressum,

    // Community gallery state
    communityItems: [],
    communityLoading: false,
    communityLoadingMore: false,
    communityError: null,
    communityTotal: 0,
    communityOffset: 0,
    communityHasMore: true,
    communitySubmitting: false,
    showCommunityConsent: false,
    isPublicGalleryEnabled: galleryConfig.isPublicGalleryEnabled,

    // Lightbox state
    lightboxOpen: false,
    lightboxIndex: 0,
  };
}
