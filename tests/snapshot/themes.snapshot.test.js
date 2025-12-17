import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';

import { settings, themePresets } from '../../src/config/settings.js';
import { SVGRenderer } from '../../src/rendering/core/svg-renderer.js';
import { compareSVGSnapshot, ensureSnapshotDir } from './setup.js';

let originalSettings;

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.XMLSerializer = dom.window.XMLSerializer;

async function setupFont() {
  const fontPath = join(process.cwd(), 'fonts', 'Kario39C3Var-Roman.ttf');
  const fontBuffer = readFileSync(fontPath);

  global.fetch = vi.fn().mockResolvedValue({
    arrayBuffer: () => Promise.resolve(fontBuffer.buffer),
  });

  const { loadFont } = await import('../../src/export/font-loader.js');
  await loadFont();
}

function createSVGDocument(size) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  return svg;
}

function serializeSVG(svg) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

function applyTestSettings(theme, overrides = {}) {
  const preset = themePresets[theme];
  originalSettings = { ...settings };

  settings.theme = theme;
  settings.text = overrides.text || preset?.text || 'TEST';
  settings.numLines = overrides.numLines || preset?.numLines || 5;
  settings.minWeight = 10;
  settings.maxWeight = 100;
  settings.canvasSize = 500;
  settings.margin = 25;
  settings.lineSpacingFactor = 0.92;
  settings.time = 0;
  settings.colorMode = preset?.colorMode || 'mono';
  settings.mode = 'wave';
  settings.toggleVariant = 'left-outlined';
  settings.widthValue = 100;
  settings.opszValue = 14;
  settings.capabilities = preset?.capabilities || { animated: false, variableWeight: true };

  Object.assign(settings, overrides);
}

function restoreSettings() {
  if (originalSettings) {
    Object.assign(settings, originalSettings);
  }
}

describe('Theme Snapshot Tests', () => {
  beforeAll(async () => {
    ensureSnapshotDir();
    await setupFont();
  });

  afterEach(() => {
    restoreSettings();
    vi.clearAllMocks();
  });

  describe('SVG Snapshots', () => {
    describe('lines theme', () => {
      it('renders correctly with default settings', async () => {
        applyTestSettings('lines', {
          text: 'HELLO',
          numLines: 5,
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderLinesTheme } = await import('../../src/rendering/themes/lines.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderLinesTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('lines-default', svgString);

        expect(result.match).toBe(true);
        if (!result.match) {
          console.log('Expected:', result.expected?.substring(0, 500));
          console.log('Actual:', result.actual?.substring(0, 500));
        }
      });

      it('renders correctly with single line', async () => {
        applyTestSettings('lines', {
          text: 'ABC',
          numLines: 1,
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderLinesTheme } = await import('../../src/rendering/themes/lines.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderLinesTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('lines-single-line', svgString);

        expect(result.match).toBe(true);
      });

      it('renders correctly with many lines', async () => {
        applyTestSettings('lines', {
          text: 'XYZ',
          numLines: 11,
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderLinesTheme } = await import('../../src/rendering/themes/lines.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderLinesTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('lines-many-lines', svgString);

        expect(result.match).toBe(true);
      });
    });

    describe('toggle theme', () => {
      it('renders single-row layout correctly', async () => {
        applyTestSettings('toggle', {
          text: 'POWER',
          toggleVariant: 'left-outlined',
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderToggleTheme } = await import('../../src/rendering/themes/toggle.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderToggleTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('toggle-single-row', svgString);

        expect(result.match).toBe(true);
      });

      it('renders two-row layout correctly', async () => {
        applyTestSettings('toggle39c3Animated', {
          text: 'CYCLES',
          toggleVariant: 'left-filled',
          capabilities: { animated: false, variableWeight: false },
        });

        const { renderToggleTheme } = await import('../../src/rendering/themes/toggle.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderToggleTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('toggle-two-row', svgString);

        expect(result.match).toBe(true);
      });

      it('renders right-outlined variant correctly', async () => {
        applyTestSettings('toggle', {
          text: 'POWER',
          toggleVariant: 'right-outlined',
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderToggleTheme } = await import('../../src/rendering/themes/toggle.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderToggleTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('toggle-right-outlined', svgString);

        expect(result.match).toBe(true);
      });

      it('renders right-filled variant correctly', async () => {
        applyTestSettings('toggle', {
          text: 'POWER',
          toggleVariant: 'right-filled',
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderToggleTheme } = await import('../../src/rendering/themes/toggle.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderToggleTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('toggle-right-filled', svgString);

        expect(result.match).toBe(true);
      });

      it('renders toggle39c3Static theme correctly', async () => {
        applyTestSettings('toggle39c3Static', {
          text: 'POWER CYCLES',
          toggleVariant: 'left-filled',
          capabilities: { animated: false, variableWeight: false },
        });

        const { renderToggleTheme } = await import('../../src/rendering/themes/toggle.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderToggleTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('toggle-static', svgString);

        expect(result.match).toBe(true);
      });
    });

    describe('terminal theme', () => {
      it('renders correctly', async () => {
        applyTestSettings('terminal', {
          text: 'HACK',
          numLines: 5,
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderTerminalTheme } = await import('../../src/rendering/themes/terminal.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderTerminalTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('terminal-default', svgString);

        expect(result.match).toBe(true);
      });
    });

    describe('multiline theme', () => {
      it('renders correctly', async () => {
        applyTestSettings('multiline', {
          text: 'HELLO\nWORLD',
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderMultilineTheme } = await import('../../src/rendering/themes/multiline.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderMultilineTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('multiline-default', svgString);

        expect(result.match).toBe(true);
      });

      it('renders with inline toggle glyph', async () => {
        applyTestSettings('multiline', {
          text: '\uE000 39C3\nPOWER',
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderMultilineTheme } = await import('../../src/rendering/themes/multiline.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderMultilineTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('multiline-toggle-outlined', svgString);

        expect(result.match).toBe(true);
      });

      it('renders with 39C3 logo glyph', async () => {
        applyTestSettings('multiline', {
          text: '\uE002\nPOWER CYCLES',
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderMultilineTheme } = await import('../../src/rendering/themes/multiline.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderMultilineTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('multiline-39c3-logo', svgString);

        expect(result.match).toBe(true);
      });
    });

    describe('ccc theme', () => {
      it('renders correctly', async () => {
        applyTestSettings('ccc', {
          text: '\uE002',
          numLines: 5,
          capabilities: { animated: false, variableWeight: false },
        });

        const { renderCCCTheme } = await import('../../src/rendering/themes/ccc.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderCCCTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('ccc-default', svgString);

        expect(result.match).toBe(true);
      });
    });

    describe('dvd theme', () => {
      it('renders correctly at initial position', async () => {
        applyTestSettings('dvd', {
          text: '\uE002',
          time: 0,
          capabilities: { animated: false, variableWeight: false },
        });

        const { renderDVDTheme } = await import('../../src/rendering/themes/dvd.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderDVDTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('dvd-default', svgString);

        expect(result.match).toBe(true);
      });

      it('renders at mid-bounce position', async () => {
        applyTestSettings('dvd', {
          text: '\uE002',
          time: 5,
          capabilities: { animated: true, variableWeight: false },
        });

        const { renderDVDTheme } = await import('../../src/rendering/themes/dvd.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderDVDTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot('dvd-mid-bounce', svgString);

        expect(result.match).toBe(true);
      });
    });
  });

  describe('Color Mode Snapshots', () => {
    const colorModes = [
      'mono',
      'mono-inv',
      'green',
      'green-smooth',
      'green-inv',
      'violet',
      'violet-smooth',
      'violet-inv',
    ];

    for (const colorMode of colorModes) {
      it(`renders correctly with ${colorMode} color mode`, async () => {
        applyTestSettings('lines', {
          text: 'COLOR',
          numLines: 3,
          colorMode: colorMode,
          capabilities: { animated: false, variableWeight: true },
        });

        const { renderLinesTheme } = await import('../../src/rendering/themes/lines.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderLinesTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot(`colormode-${colorMode}`, svgString);

        expect(result.match).toBe(true);
      });
    }
  });

  describe('Animation Mode Snapshots', () => {
    const animationModes = ['wave', 'pulse', 'rotate', 'breathe', 'bounce', 'spotlight'];

    for (const mode of animationModes) {
      it(`renders correctly with ${mode} animation mode`, async () => {
        applyTestSettings('lines', {
          text: 'ANIM',
          numLines: 5,
          mode: mode,
          time: 1.5,
          capabilities: { animated: true, variableWeight: true },
          animationOriginX: 0.5,
          animationOriginY: 0.5,
          animationPhaseOffset: 0,
        });

        const { renderLinesTheme } = await import('../../src/rendering/themes/lines.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderLinesTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot(`animmode-${mode}`, svgString);

        expect(result.match).toBe(true);
      });
    }
  });

  describe('Frame Snapshots (shareable animation states)', () => {
    const frames = [0, 1.25, 2.5, 3.75];

    for (const frame of frames) {
      it(`lines theme renders consistently at frame ${frame}`, async () => {
        applyTestSettings('lines', {
          text: 'SHARE',
          numLines: 5,
          time: frame,
          mode: 'wave',
          capabilities: { animated: true, variableWeight: true },
        });

        const { renderLinesTheme } = await import('../../src/rendering/themes/lines.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderLinesTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot(`frame-lines-t${frame}`, svgString);

        expect(result.match).toBe(true);
      });
    }

    for (const frame of frames) {
      it(`toggle theme renders consistently at frame ${frame}`, async () => {
        applyTestSettings('toggle', {
          text: 'CYCLES',
          time: frame,
          toggleVariant: 'left-outlined',
          capabilities: { animated: true, variableWeight: true },
        });

        const { renderToggleTheme } = await import('../../src/rendering/themes/toggle.js');
        const svg = createSVGDocument(settings.canvasSize);
        const renderer = new SVGRenderer(svg);

        renderToggleTheme(renderer, settings.canvasSize);

        const svgString = serializeSVG(svg);
        const result = compareSVGSnapshot(`frame-toggle-t${frame}`, svgString);

        expect(result.match).toBe(true);
      });
    }
  });
});
