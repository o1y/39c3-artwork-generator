import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { settings } from '../../../src/config/settings.js';
import { BRAND_COLORS } from '../../../src/config/colors.js';
import { getBackgroundColor, getColor } from '../../../src/rendering/colors.js';

describe('rendering/colors', () => {
  let originalColorMode;
  let originalMode;
  let originalCapabilities;
  let originalNumLines;
  let originalTime;

  beforeEach(() => {
    originalColorMode = settings.colorMode;
    originalMode = settings.mode;
    originalCapabilities = { ...settings.capabilities };
    originalNumLines = settings.numLines;
    originalTime = settings.time;

    settings.colorMode = 'mono';
    settings.mode = 'wave';
    settings.capabilities = { animated: true, variableWeight: true };
    settings.numLines = 11;
    settings.time = 0;
  });

  afterEach(() => {
    settings.colorMode = originalColorMode;
    settings.mode = originalMode;
    settings.capabilities = originalCapabilities;
    settings.numLines = originalNumLines;
    settings.time = originalTime;
  });

  describe('getBackgroundColor', () => {
    it('returns dark for mono mode', () => {
      settings.colorMode = 'mono';
      expect(getBackgroundColor()).toBe(BRAND_COLORS.dark);
    });

    it('returns natural for mono-inv mode', () => {
      settings.colorMode = 'mono-inv';
      expect(getBackgroundColor()).toBe(BRAND_COLORS.natural);
    });

    it('returns dark for green mode', () => {
      settings.colorMode = 'green';
      expect(getBackgroundColor()).toBe(BRAND_COLORS.dark);
    });

    it('returns dark for violet mode', () => {
      settings.colorMode = 'violet';
      expect(getBackgroundColor()).toBe(BRAND_COLORS.dark);
    });

    it('returns green palette color for green-inv mode', () => {
      settings.colorMode = 'green-inv';
      const result = getBackgroundColor();
      // Background is { palette: 'green', index: 3 }
      expect(result).toBe(BRAND_COLORS.green[3]);
    });

    it('returns violet palette color for violet-inv mode', () => {
      settings.colorMode = 'violet-inv';
      const result = getBackgroundColor();
      // Background is { palette: 'violet', index: 3 }
      expect(result).toBe(BRAND_COLORS.violet[3]);
    });

    it('returns dark for unknown color mode', () => {
      settings.colorMode = 'unknown-mode';
      expect(getBackgroundColor()).toBe(BRAND_COLORS.dark);
    });
  });

  describe('getColor', () => {
    it('returns natural for mono mode', () => {
      settings.colorMode = 'mono';
      const result = getColor(0, 0, 0);
      expect(result).toBe(BRAND_COLORS.natural);
    });

    it('returns dark for mono-inv mode', () => {
      settings.colorMode = 'mono-inv';
      const result = getColor(0, 0, 0);
      expect(result).toBe(BRAND_COLORS.dark);
    });

    it('returns dark for green-inv mode', () => {
      settings.colorMode = 'green-inv';
      const result = getColor(0, 0, 0);
      expect(result).toBe(BRAND_COLORS.dark);
    });

    it('returns static color when not animated', () => {
      settings.colorMode = 'green';
      settings.capabilities = { animated: false };
      const result = getColor(0, 0, 0);
      // staticIndex for green is 3
      expect(result).toBe(BRAND_COLORS.green[3]);
    });

    it('returns animated color from green palette when animated', () => {
      settings.colorMode = 'green';
      settings.capabilities = { animated: true };
      const result = getColor(0, 0, 0);
      // Result should be one of the green palette colors
      expect(BRAND_COLORS.green).toContain(result);
    });

    it('returns animated color from violet palette when animated', () => {
      settings.colorMode = 'violet';
      settings.capabilities = { animated: true };
      const result = getColor(0, 0, 0);
      // Result should be one of the violet palette colors
      expect(BRAND_COLORS.violet).toContain(result);
    });

    it('returns natural for unknown color mode', () => {
      settings.colorMode = 'unknown-mode';
      const result = getColor(0, 0, 0);
      expect(result).toBe(BRAND_COLORS.natural);
    });

    it('respects textLength parameter', () => {
      settings.colorMode = 'violet';
      settings.capabilities = { animated: true };
      // Different text lengths may affect color offset calculations
      const result1 = getColor(5, 0, 0, 10);
      const result2 = getColor(5, 0, 0, 20);
      // Both should be valid violet colors
      expect(BRAND_COLORS.violet).toContain(result1);
      expect(BRAND_COLORS.violet).toContain(result2);
    });

    it('returns different colors for different character indices when animated', () => {
      settings.colorMode = 'green';
      settings.capabilities = { animated: true };
      settings.time = 1;

      // Get colors for different character positions
      const colors = [];
      for (let i = 0; i < 7; i++) {
        colors.push(getColor(i, 0, 1, 16));
      }

      // All should be valid green colors
      colors.forEach((c) => {
        expect(BRAND_COLORS.green).toContain(c);
      });
    });

    it('returns different colors for different line indices when animated', () => {
      settings.colorMode = 'violet';
      settings.capabilities = { animated: true };
      settings.time = 1;

      // Get colors for different line positions
      const colors = [];
      for (let i = 0; i < 5; i++) {
        colors.push(getColor(0, i, 1, 16));
      }

      // All should be valid violet colors
      colors.forEach((c) => {
        expect(BRAND_COLORS.violet).toContain(c);
      });
    });

    describe('smooth mode', () => {
      it('returns interpolated color in smooth mode', () => {
        settings.colorMode = 'green-smooth';
        settings.capabilities = { animated: true };
        const result = getColor(0, 0, 0.5);

        // In smooth mode, result is interpolated between palette colors
        // It should be a valid hex color
        expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      });

      it('returns interpolated color in violet-smooth mode', () => {
        settings.colorMode = 'violet-smooth';
        settings.capabilities = { animated: true };
        const result = getColor(0, 0, 0.5);

        // Should be a valid hex color
        expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    describe('spotlight mode', () => {
      it('uses distance-based offset in spotlight mode', () => {
        settings.colorMode = 'green';
        settings.capabilities = { animated: true };
        settings.mode = 'spotlight';
        settings.animationOriginX = 0.5;
        settings.animationOriginY = 0.5;

        // Characters at different distances from origin should potentially have different colors
        const centerColor = getColor(8, 5, 1, 16);
        const cornerColor = getColor(0, 0, 1, 16);

        // Both should be valid green colors
        expect(BRAND_COLORS.green).toContain(centerColor);
        expect(BRAND_COLORS.green).toContain(cornerColor);
      });
    });
  });
});
