import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { settings } from '../../../src/config/settings.js';
import { getNormalizedTime } from '../../../src/animation/timing.js';

describe('timing', () => {
  describe('getNormalizedTime', () => {
    let originalAnimationSpeed;

    beforeEach(() => {
      originalAnimationSpeed = settings.animationSpeed;
      settings.animationSpeed = 1.0;
    });

    afterEach(() => {
      settings.animationSpeed = originalAnimationSpeed;
    });

    it('returns 0 at time=0', () => {
      expect(getNormalizedTime(0)).toBe(0);
    });

    it('returns a value between 0 and 2*PI', () => {
      const result = getNormalizedTime(1);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(2 * Math.PI);
    });

    it('returns approximately 0 after a full cycle', () => {
      // At 30fps, 5 seconds = 150 frames
      // With animationSpeed=1, one full cycle is 5 seconds
      // time=5 should complete one cycle and wrap back to ~0
      const result = getNormalizedTime(5);
      expect(result).toBeCloseTo(0, 5);
    });

    it('returns PI at halfway through the cycle', () => {
      // At 30fps, 2.5 seconds = 75 frames = half of 150 frames
      // cycleProgress = 75/150 = 0.5
      // normalized = 0.5 * 2 * PI = PI
      const result = getNormalizedTime(2.5);
      expect(result).toBeCloseTo(Math.PI, 5);
    });

    it('respects animationSpeed multiplier - faster', () => {
      settings.animationSpeed = 2.0;
      // At speed 2, maxFrames = 150/2 = 75
      // At t=1.25, frames = 1.25*30 = 37.5 = 37 (floor)
      // cycleProgress = 37/75 = ~0.493
      // This should be close to halfway through the cycle
      const fastResult = getNormalizedTime(1.25);

      settings.animationSpeed = 1.0;
      // At speed 1, maxFrames = 150
      // At t=2.5, frames = 2.5*30 = 75
      // cycleProgress = 75/150 = 0.5
      const normalResult = getNormalizedTime(2.5);

      // Both should be approximately at PI (halfway)
      expect(fastResult).toBeCloseTo(Math.PI, 1);
      expect(normalResult).toBeCloseTo(Math.PI, 5);
    });

    it('respects animationSpeed multiplier - slower', () => {
      settings.animationSpeed = 0.5;
      // At speed 0.5, maxFrames = 150/0.5 = 300
      // Cycle takes 10 seconds instead of 5
      // At t=5, frames = 5*30 = 150
      // cycleProgress = 150/300 = 0.5
      const slowResult = getNormalizedTime(5);

      expect(slowResult).toBeCloseTo(Math.PI, 5);
    });

    it('always returns value in [0, 2*PI) range for any time input', () => {
      const testTimes = [0, 0.1, 0.5, 1, 2, 3, 5, 10, 100, 1000];
      for (const t of testTimes) {
        const result = getNormalizedTime(t);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(2 * Math.PI);
      }
    });

    it('handles fractional time values correctly', () => {
      const result1 = getNormalizedTime(0.5);
      const result2 = getNormalizedTime(0.51);

      // Small time difference should produce small result difference
      expect(Math.abs(result2 - result1)).toBeLessThan(0.5);
    });

    it('wraps correctly at cycle boundaries', () => {
      // Test multiple full cycles
      const result0 = getNormalizedTime(0);
      const result5 = getNormalizedTime(5); // 1 cycle
      const result10 = getNormalizedTime(10); // 2 cycles

      expect(result0).toBeCloseTo(result5, 5);
      expect(result0).toBeCloseTo(result10, 5);
    });
  });
});
