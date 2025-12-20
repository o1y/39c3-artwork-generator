import { describe, it, expect } from 'vitest';
import { isKeyRelevant, KEY_MAP } from '../../../src/config/url-keys.js';
import { themePresets } from '../../../src/config/settings.js';

describe('config/url-keys', () => {
  describe('isKeyRelevant', () => {
    describe('control-based relevance', () => {
      it('minWeight is relevant when showMinWeight control is true', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.controls.showMinWeight ?? false;
          const actual = isKeyRelevant('minWeight', themeName, {});
          expect(actual, `${themeName}: minWeight relevance should match showMinWeight`).toBe(
            expected
          );
        }
      });

      it('maxWeight is relevant when showMaxWeight control is true', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.controls.showMaxWeight ?? false;
          const actual = isKeyRelevant('maxWeight', themeName, {});
          expect(actual, `${themeName}: maxWeight relevance should match showMaxWeight`).toBe(
            expected
          );
        }
      });

      it('opszValue is relevant when showOpsz control is true', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.controls.showOpsz ?? false;
          const actual = isKeyRelevant('opszValue', themeName, {});
          expect(actual, `${themeName}: opszValue relevance should match showOpsz`).toBe(expected);
        }
      });

      it('numLines is relevant when showLines control is true', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.controls.showLines ?? false;
          const actual = isKeyRelevant('numLines', themeName, {});
          expect(actual, `${themeName}: numLines relevance should match showLines`).toBe(expected);
        }
      });

      it('widthValue is relevant when showWidth control is true', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.controls.showWidth ?? false;
          const actual = isKeyRelevant('widthValue', themeName, {});
          expect(actual, `${themeName}: widthValue relevance should match showWidth`).toBe(
            expected
          );
        }
      });

      it('toggleVariant is relevant when showToggleVariant control is true', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.controls.showToggleVariant ?? false;
          const actual = isKeyRelevant('toggleVariant', themeName, {});
          expect(
            actual,
            `${themeName}: toggleVariant relevance should match showToggleVariant`
          ).toBe(expected);
        }
      });
    });

    describe('capability-based relevance', () => {
      it('mode is relevant when theme is animated', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.capabilities.animated ?? false;
          const actual = isKeyRelevant('mode', themeName, {});
          expect(actual, `${themeName}: mode relevance should match animated capability`).toBe(
            expected
          );
        }
      });

      it('animationSpeed is relevant when theme is animated', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = theme.capabilities.animated ?? false;
          const actual = isKeyRelevant('animationSpeed', themeName, {});
          expect(
            actual,
            `${themeName}: animationSpeed relevance should match animated capability`
          ).toBe(expected);
        }
      });

      it('staticWeight is relevant when variableWeight is false', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const expected = !(theme.capabilities.variableWeight ?? true);
          const actual = isKeyRelevant('staticWeight', themeName, {});
          expect(
            actual,
            `${themeName}: staticWeight relevance should be inverse of variableWeight`
          ).toBe(expected);
        }
      });
    });

    describe('always relevant keys', () => {
      const alwaysRelevantKeys = ['text', 'theme', 'colorMode'];

      for (const key of alwaysRelevantKeys) {
        it(`${key} is always relevant`, () => {
          for (const themeName of Object.keys(themePresets)) {
            expect(isKeyRelevant(key, themeName, {})).toBe(true);
          }
        });
      }
    });

    describe('state-dependent relevance', () => {
      it('currentFrame is only relevant when animated and paused', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const isAnimated = theme.capabilities.animated ?? false;

          expect(isKeyRelevant('currentFrame', themeName, { isPaused: false })).toBe(false);
          expect(isKeyRelevant('currentFrame', themeName, { isPaused: true })).toBe(isAnimated);
        }
      });

      it('animationOriginX/Y are only relevant in spotlight mode', () => {
        for (const [themeName, theme] of Object.entries(themePresets)) {
          const isAnimated = theme.capabilities.animated ?? false;

          expect(isKeyRelevant('animationOriginX', themeName, { mode: 'wave' })).toBe(false);
          expect(isKeyRelevant('animationOriginX', themeName, { mode: 'spotlight' })).toBe(
            isAnimated
          );
          expect(isKeyRelevant('animationOriginY', themeName, { mode: 'spotlight' })).toBe(
            isAnimated
          );
        }
      });
    });

    describe('unknown keys and themes', () => {
      it('returns true for unknown keys', () => {
        expect(isKeyRelevant('unknownKey', 'lines', {})).toBe(true);
      });

      it('returns true for unknown themes', () => {
        expect(isKeyRelevant('minWeight', 'unknownTheme', {})).toBe(true);
      });
    });

    describe('KEY_MAP coverage', () => {
      it('all KEY_MAP entries have relevance checks or are always relevant', () => {
        const keys = Object.keys(KEY_MAP);
        for (const key of keys) {
          // Should not throw
          expect(() => isKeyRelevant(key, 'lines', {})).not.toThrow();
        }
      });
    });
  });
});
