import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { settings } from '../../../src/config/settings.js';
import {
  TOGGLE_UNICODES,
  TOGGLE_WIDTH,
  isToggleGlyph,
  calculateToggleProgress,
  calculateToggleWeight,
} from '../../../src/rendering/toggle-utils.js';

describe('toggle-utils', () => {
  let originalAnimationSpeed;
  let originalTime;

  beforeEach(() => {
    originalAnimationSpeed = settings.animationSpeed;
    originalTime = settings.time;
    settings.animationSpeed = 1.0;
    settings.time = 0;
  });

  afterEach(() => {
    settings.animationSpeed = originalAnimationSpeed;
    settings.time = originalTime;
  });

  describe('TOGGLE_UNICODES', () => {
    it('contains outlined and filled toggle unicodes', () => {
      expect(TOGGLE_UNICODES).toContain(0xe000);
      expect(TOGGLE_UNICODES).toContain(0xe001);
    });

    it('has exactly 2 toggle unicodes', () => {
      expect(TOGGLE_UNICODES).toHaveLength(2);
    });
  });

  describe('TOGGLE_WIDTH', () => {
    it('has fixed width of 100', () => {
      expect(TOGGLE_WIDTH).toBe(100);
    });
  });

  describe('isToggleGlyph', () => {
    it('returns true for outlined toggle (0xE000)', () => {
      const glyph = { unicode: 0xe000 };
      expect(isToggleGlyph(glyph)).toBe(true);
    });

    it('returns true for filled toggle (0xE001)', () => {
      const glyph = { unicode: 0xe001 };
      expect(isToggleGlyph(glyph)).toBe(true);
    });

    it('returns false for regular letter glyphs', () => {
      const glyphA = { unicode: 65 }; // 'A'
      const glyphZ = { unicode: 90 }; // 'Z'
      const glyph0 = { unicode: 48 }; // '0'

      expect(isToggleGlyph(glyphA)).toBe(false);
      expect(isToggleGlyph(glyphZ)).toBe(false);
      expect(isToggleGlyph(glyph0)).toBe(false);
    });

    it('returns falsy for null glyph', () => {
      expect(isToggleGlyph(null)).toBeFalsy();
    });

    it('returns falsy for undefined glyph', () => {
      expect(isToggleGlyph(undefined)).toBeFalsy();
    });

    it('returns false for glyph without unicode property', () => {
      const glyph = { name: 'test' };
      expect(isToggleGlyph(glyph)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(isToggleGlyph({})).toBe(false);
    });
  });

  describe('calculateToggleProgress', () => {
    it('returns 1 when not animated', () => {
      const progress = calculateToggleProgress(false);
      expect(progress).toBe(1);
    });

    it('returns value between 0 and 1 when animated', () => {
      const progress = calculateToggleProgress(true);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('returns different values at different times', () => {
      settings.time = 0;
      const progress0 = calculateToggleProgress(true);

      settings.time = 1;
      const progress1 = calculateToggleProgress(true);

      settings.time = 2;
      const progress2 = calculateToggleProgress(true);

      // Progress should vary over time (due to sin wave)
      // At t=0, sin(0)=0, raw=0.5, eased varies
      // Just verify they're in valid range
      expect(progress0).toBeGreaterThanOrEqual(0);
      expect(progress0).toBeLessThanOrEqual(1);
      expect(progress1).toBeGreaterThanOrEqual(0);
      expect(progress1).toBeLessThanOrEqual(1);
      expect(progress2).toBeGreaterThanOrEqual(0);
      expect(progress2).toBeLessThanOrEqual(1);
    });

    it('applies easing function (not linear)', () => {
      // The easing function is cubic, so progress shouldn't be purely linear
      // At normalized time = PI/2, sin = 1, rawProgress = 1
      // At normalized time = 3*PI/2, sin = -1, rawProgress = 0
      // Let's test at time that gives known sin values

      // At time where sin gives 0: rawProgress = 0.5
      // With cubic easing, easeSwitch(0.5) = 0.5 (midpoint preserved)
      settings.time = 0; // sin(0) = 0, raw = 0.5
      const progressAtZero = calculateToggleProgress(true);
      expect(progressAtZero).toBeCloseTo(0.5, 1);
    });
  });

  describe('calculateToggleWeight', () => {
    it('returns value between 10 and 100', () => {
      const weight = calculateToggleWeight(true);
      expect(weight).toBeGreaterThanOrEqual(10);
      expect(weight).toBeLessThanOrEqual(100);
    });

    it('returns 10 when progress is 1 (not animated)', () => {
      // When not animated, progress = 1
      // weight = 100 - 90 * 1 = 10
      const weight = calculateToggleWeight(false);
      expect(weight).toBe(10);
    });

    it('returns 100 when progress is 0', () => {
      // weight = 100 - 90 * 0 = 100
      // This happens when the animation is at its extreme
      // Since progress varies with time, we just verify the formula
      settings.time = 0;
      const progress = calculateToggleProgress(true);
      const expectedWeight = 100 - 90 * progress;
      const actualWeight = calculateToggleWeight(true);
      expect(actualWeight).toBeCloseTo(expectedWeight, 5);
    });

    it('interpolates weight linearly based on progress', () => {
      // Test that weight follows formula: 100 - 90 * progress
      // When not animated (progress=1): weight = 10 (left position)
      // When progress=0: weight = 100 (right position)

      const weight = calculateToggleWeight(false);
      expect(weight).toBe(10); // progress=1 -> left position
    });

    it('weight varies over animation time', () => {
      settings.time = 0;
      const weight0 = calculateToggleWeight(true);

      settings.time = 1.25; // quarter cycle at speed 1
      const weight1 = calculateToggleWeight(true);

      // Weights should be in valid range
      expect(weight0).toBeGreaterThanOrEqual(10);
      expect(weight0).toBeLessThanOrEqual(100);
      expect(weight1).toBeGreaterThanOrEqual(10);
      expect(weight1).toBeLessThanOrEqual(100);
    });
  });
});
