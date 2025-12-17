import { vi } from 'vitest';

export function createSettingsMock(overrides = {}) {
  return {
    text: '39C3 POWER CYCLES',
    numLines: 11,
    minWeight: 10,
    maxWeight: 100,
    staticWeight: 80,
    widthValue: 100,
    opszValue: 14,
    lineSpacingFactor: 0.92,
    canvasSize: 1000,
    margin: 50,
    time: 0,
    animationSpeed: 1.0,
    mode: 'wave',
    theme: 'lines',
    toggleVariant: 'left-filled',
    colorMode: 'violet-inv',
    animationOriginX: 1,
    animationOriginY: 1,
    animationPhaseOffset: 0,
    ...overrides,
  };
}

export function createConstantsMock(overrides = {}) {
  return {
    ANIMATION_FPS: 30,
    ANIMATION_CYCLE_SECONDS: 5,
    TOTAL_FRAMES: 150, // 30 * 5
    MAX_EXPORT_FRAMES: 500,
    COLOR_MODE_OPTIONS: [],
    THEME_COLOR_CLASS_MAP: {},
    AVAILABLE_RESOLUTIONS: [],
    AVAILABLE_GIF_RESOLUTIONS: [],
    ANIMATION_MODE_OPTIONS: [],
    EXPORT_FORMAT_OPTIONS: [],
    ...overrides,
  };
}

export function mockSettingsModule(settingsOverrides = {}) {
  const mockSettings = createSettingsMock(settingsOverrides);
  vi.doMock('../../src/config/settings.js', () => ({
    settings: mockSettings,
    themePresets: {},
    FONT_AXES: { weight: [10, 100], width: [50, 160], opticalSize: [8, 140] },
    VALID_MODES: ['wave', 'pulse', 'rotate', 'breathe', 'bounce', 'spotlight'],
    defaultTexts: { default: '39C3 POWER CYCLES', ccc: '\uE002' },
  }));
  return mockSettings;
}

export function mockConstantsModule(constantsOverrides = {}) {
  const mockConstants = createConstantsMock(constantsOverrides);
  vi.doMock('../../src/ui/state/constants.js', () => mockConstants);
  return mockConstants;
}
