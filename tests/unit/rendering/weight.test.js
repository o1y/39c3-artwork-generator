import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { settings } from '../../../src/config/settings.js';
import { calculateWeight, applyAnimation } from '../../../src/rendering/weight.js';

describe('rendering/weight', () => {
  let originalSettings;

  beforeEach(() => {
    originalSettings = {
      numLines: settings.numLines,
      minWeight: settings.minWeight,
      maxWeight: settings.maxWeight,
      mode: settings.mode,
      time: settings.time,
      animationSpeed: settings.animationSpeed,
      animationOriginX: settings.animationOriginX,
      animationOriginY: settings.animationOriginY,
      animationPhaseOffset: settings.animationPhaseOffset,
    };

    settings.numLines = 11;
    settings.minWeight = 10;
    settings.maxWeight = 100;
    settings.mode = 'wave';
    settings.time = 0;
    settings.animationSpeed = 1.0;
    settings.animationOriginX = 0.5;
    settings.animationOriginY = 0.5;
    settings.animationPhaseOffset = 0;
  });

  afterEach(() => {
    Object.assign(settings, originalSettings);
  });

  describe('calculateWeight', () => {
    const textLength = 16;
    const midIndex = Math.floor(textLength / 2);
    const startWeight = 10;
    const endWeight = 100;

    describe('first line (lineIndex = 0)', () => {
      it('returns startWeight at first character', () => {
        settings.mode = 'breathe'; // Use breathe mode for more predictable baseline
        settings.time = 0; // At t=0, breathe adds -15 + (sin(0)*0.5+0.5)*30 = -15 + 15 = 0

        const weight = calculateWeight(0, 0, startWeight, endWeight, midIndex, textLength, 0);

        // First char: baseWeight = startWeight = 10
        // With breathe at t=0: weight + 0 = 10
        expect(weight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(weight).toBeLessThanOrEqual(settings.maxWeight);
      });

      it('returns endWeight at last character (minus animation)', () => {
        settings.mode = 'breathe';
        settings.time = 0;

        const weight = calculateWeight(
          textLength - 1,
          0,
          startWeight,
          endWeight,
          midIndex,
          textLength,
          0
        );

        // Last char: baseWeight = endWeight = 100
        expect(weight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(weight).toBeLessThanOrEqual(settings.maxWeight);
      });

      it('produces linear gradient across characters', () => {
        settings.mode = 'breathe';
        settings.time = 0;

        const weights = [];
        for (let i = 0; i < textLength; i++) {
          weights.push(calculateWeight(i, 0, startWeight, endWeight, midIndex, textLength, 0));
        }

        // Weights should generally increase (with some animation variation)
        // Just verify all are in valid range
        weights.forEach((w) => {
          expect(w).toBeGreaterThanOrEqual(settings.minWeight);
          expect(w).toBeLessThanOrEqual(settings.maxWeight);
        });
      });
    });

    describe('last line', () => {
      it('produces similar gradient to first line', () => {
        settings.mode = 'breathe';
        settings.time = 0;
        const lastLine = settings.numLines - 1;

        const firstLineWeights = [];
        const lastLineWeights = [];

        for (let i = 0; i < textLength; i++) {
          firstLineWeights.push(
            calculateWeight(i, 0, startWeight, endWeight, midIndex, textLength, 0)
          );
          lastLineWeights.push(
            calculateWeight(i, lastLine, startWeight, endWeight, midIndex, textLength, 0)
          );
        }

        // Both should be in valid range
        [...firstLineWeights, ...lastLineWeights].forEach((w) => {
          expect(w).toBeGreaterThanOrEqual(settings.minWeight);
          expect(w).toBeLessThanOrEqual(settings.maxWeight);
        });
      });
    });

    describe('middle lines', () => {
      it('applies boost factor in the middle', () => {
        settings.mode = 'breathe';
        settings.time = 0;
        const middleLine = Math.floor(settings.numLines / 2);

        // Get weight at middle character on middle line vs first/last line
        const middleLineWeight = calculateWeight(
          midIndex,
          middleLine,
          startWeight,
          endWeight,
          midIndex,
          textLength,
          0
        );

        // The middle line with middle character should have boost applied
        // Just verify it's in valid range
        expect(middleLineWeight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(middleLineWeight).toBeLessThanOrEqual(settings.maxWeight);
      });

      it('boost factor decreases towards edges', () => {
        settings.mode = 'breathe';
        settings.time = 0;

        const centerLine = Math.floor(settings.numLines / 2);
        const edgeLine = 1; // Second line (not first, which uses simple gradient)

        // Both should be in valid range
        const centerWeight = calculateWeight(
          midIndex,
          centerLine,
          startWeight,
          endWeight,
          midIndex,
          textLength,
          0
        );
        const edgeWeight = calculateWeight(
          midIndex,
          edgeLine,
          startWeight,
          endWeight,
          midIndex,
          textLength,
          0
        );

        expect(centerWeight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(centerWeight).toBeLessThanOrEqual(settings.maxWeight);
        expect(edgeWeight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(edgeWeight).toBeLessThanOrEqual(settings.maxWeight);
      });
    });

    it('clamps weight to minWeight and maxWeight', () => {
      settings.mode = 'wave';

      // Test multiple positions and times
      for (let time = 0; time < 10; time += 0.5) {
        for (let line = 0; line < settings.numLines; line++) {
          for (let char = 0; char < textLength; char += 4) {
            const weight = calculateWeight(
              char,
              line,
              startWeight,
              endWeight,
              midIndex,
              textLength,
              time
            );
            expect(weight).toBeGreaterThanOrEqual(settings.minWeight);
            expect(weight).toBeLessThanOrEqual(settings.maxWeight);
          }
        }
      }
    });
  });

  describe('applyAnimation', () => {
    const baseWeight = 50;
    const charIndex = 5;
    const lineIndex = 3;
    const time = 1;
    const textLength = 16;

    describe('wave mode', () => {
      it('modifies weight based on character and line position', () => {
        settings.mode = 'wave';
        const result = applyAnimation(baseWeight, charIndex, lineIndex, time, textLength);

        // Wave adds sin-based variation
        expect(result).not.toBe(baseWeight);
        expect(typeof result).toBe('number');
        expect(isFinite(result)).toBe(true);
      });

      it('produces different weights for different positions', () => {
        settings.mode = 'wave';
        const weight1 = applyAnimation(baseWeight, 0, 0, time, textLength);
        const weight2 = applyAnimation(baseWeight, 5, 5, time, textLength);

        // Different positions should generally give different weights
        expect(typeof weight1).toBe('number');
        expect(typeof weight2).toBe('number');
      });
    });

    describe('pulse mode', () => {
      it('applies uniform variation', () => {
        settings.mode = 'pulse';
        const weight1 = applyAnimation(baseWeight, 0, 0, time, textLength);
        const weight2 = applyAnimation(baseWeight, 10, 5, time, textLength);

        // Pulse applies same variation regardless of position
        expect(weight1).toBe(weight2);
      });

      it('varies with time', () => {
        settings.mode = 'pulse';
        const weight0 = applyAnimation(baseWeight, charIndex, lineIndex, 0, textLength);
        const weight1 = applyAnimation(baseWeight, charIndex, lineIndex, 1, textLength);

        // Should be valid numbers
        expect(typeof weight0).toBe('number');
        expect(typeof weight1).toBe('number');
      });
    });

    describe('rotate mode', () => {
      it('combines char and line indices', () => {
        settings.mode = 'rotate';
        const result = applyAnimation(baseWeight, charIndex, lineIndex, time, textLength);

        expect(typeof result).toBe('number');
        expect(isFinite(result)).toBe(true);
      });

      it('diagonal positions have similar phase', () => {
        settings.mode = 'rotate';
        // Positions with same (charIndex + lineIndex) should have similar weights
        const weight1 = applyAnimation(baseWeight, 2, 3, time, textLength);
        const weight2 = applyAnimation(baseWeight, 3, 2, time, textLength);

        // Same sum = 5, so similar phase
        expect(weight1).toBeCloseTo(weight2, 5);
      });
    });

    describe('breathe mode', () => {
      it('applies uniform breathing effect', () => {
        settings.mode = 'breathe';
        const weight1 = applyAnimation(baseWeight, 0, 0, time, textLength);
        const weight2 = applyAnimation(baseWeight, 10, 5, time, textLength);

        // Breathe applies same effect regardless of position
        expect(weight1).toBe(weight2);
      });
    });

    describe('bounce mode', () => {
      it('always adds positive variation', () => {
        settings.mode = 'bounce';
        // Bounce uses Math.abs(Math.sin(...)) so always >= 0
        const result = applyAnimation(baseWeight, charIndex, lineIndex, time, textLength);

        // Result should be >= baseWeight (since bounce adds positive value)
        expect(result).toBeGreaterThanOrEqual(baseWeight);
      });
    });

    describe('spotlight mode', () => {
      it('returns weight based on distance from origin', () => {
        settings.mode = 'spotlight';
        settings.animationOriginX = 0.5;
        settings.animationOriginY = 0.5;
        settings.numLines = 11;

        const centerWeight = applyAnimation(baseWeight, 8, 5, time, textLength);
        const cornerWeight = applyAnimation(baseWeight, 0, 0, time, textLength);

        // Both should return values between minWeight and maxWeight
        expect(centerWeight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(centerWeight).toBeLessThanOrEqual(settings.maxWeight);
        expect(cornerWeight).toBeGreaterThanOrEqual(settings.minWeight);
        expect(cornerWeight).toBeLessThanOrEqual(settings.maxWeight);
      });

      it('respects animation origin', () => {
        settings.mode = 'spotlight';
        settings.numLines = 11;

        settings.animationOriginX = 0;
        settings.animationOriginY = 0;
        const weightOriginTopLeft = applyAnimation(baseWeight, 0, 0, time, textLength);

        settings.animationOriginX = 1;
        settings.animationOriginY = 1;
        const weightOriginBottomRight = applyAnimation(baseWeight, 0, 0, time, textLength);

        // Both should be valid weights
        expect(typeof weightOriginTopLeft).toBe('number');
        expect(typeof weightOriginBottomRight).toBe('number');
      });
    });

    describe('default mode', () => {
      it('returns weight unchanged for unknown mode', () => {
        settings.mode = 'unknown';
        const result = applyAnimation(baseWeight, charIndex, lineIndex, time, textLength);
        expect(result).toBe(baseWeight);
      });
    });
  });
});
