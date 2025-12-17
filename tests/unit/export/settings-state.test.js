import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { settings } from '../../../src/config/settings.js';
import {
  captureSettingsState,
  restoreSettingsState,
  applyScaledSettings,
  resetAnimationTime,
} from '../../../src/export/utils/settings-state.js';

describe('export/utils/settings-state', () => {
  let originalSettings;

  beforeEach(() => {
    originalSettings = {
      canvasSize: settings.canvasSize,
      margin: settings.margin,
      time: settings.time,
      animationSpeed: settings.animationSpeed,
    };

    // Set known values for testing
    settings.canvasSize = 1000;
    settings.margin = 50;
    settings.time = 2.5;
    settings.animationSpeed = 1.5;
  });

  afterEach(() => {
    Object.assign(settings, originalSettings);
  });

  describe('captureSettingsState', () => {
    it('captures canvasSize', () => {
      const state = captureSettingsState();
      expect(state.canvasSize).toBe(1000);
    });

    it('captures margin', () => {
      const state = captureSettingsState();
      expect(state.margin).toBe(50);
    });

    it('captures time', () => {
      const state = captureSettingsState();
      expect(state.time).toBe(2.5);
    });

    it('captures animationSpeed', () => {
      const state = captureSettingsState();
      expect(state.animationSpeed).toBe(1.5);
    });

    it('returns an object with all expected properties', () => {
      const state = captureSettingsState();
      expect(state).toEqual({
        canvasSize: 1000,
        margin: 50,
        time: 2.5,
        animationSpeed: 1.5,
      });
    });

    it('captures current values, not defaults', () => {
      settings.canvasSize = 2000;
      settings.margin = 100;
      settings.time = 5;
      settings.animationSpeed = 2;

      const state = captureSettingsState();

      expect(state.canvasSize).toBe(2000);
      expect(state.margin).toBe(100);
      expect(state.time).toBe(5);
      expect(state.animationSpeed).toBe(2);
    });
  });

  describe('restoreSettingsState', () => {
    it('restores canvasSize', () => {
      settings.canvasSize = 500;
      const state = { canvasSize: 1000, margin: 50, time: 2.5, animationSpeed: 1.5 };

      restoreSettingsState(state);

      expect(settings.canvasSize).toBe(1000);
    });

    it('restores margin', () => {
      settings.margin = 25;
      const state = { canvasSize: 1000, margin: 50, time: 2.5, animationSpeed: 1.5 };

      restoreSettingsState(state);

      expect(settings.margin).toBe(50);
    });

    it('restores time', () => {
      settings.time = 10;
      const state = { canvasSize: 1000, margin: 50, time: 2.5, animationSpeed: 1.5 };

      restoreSettingsState(state);

      expect(settings.time).toBe(2.5);
    });

    it('restores animationSpeed', () => {
      settings.animationSpeed = 3;
      const state = { canvasSize: 1000, margin: 50, time: 2.5, animationSpeed: 1.5 };

      restoreSettingsState(state);

      expect(settings.animationSpeed).toBe(1.5);
    });

    it('restores all settings from captured state', () => {
      const captured = captureSettingsState();

      // Modify all settings
      settings.canvasSize = 9999;
      settings.margin = 9999;
      settings.time = 9999;
      settings.animationSpeed = 9999;

      restoreSettingsState(captured);

      expect(settings.canvasSize).toBe(1000);
      expect(settings.margin).toBe(50);
      expect(settings.time).toBe(2.5);
      expect(settings.animationSpeed).toBe(1.5);
    });
  });

  describe('capture and restore round-trip', () => {
    it('preserves settings through capture and restore', () => {
      settings.canvasSize = 1234;
      settings.margin = 56;
      settings.time = 7.8;
      settings.animationSpeed = 0.9;

      const captured = captureSettingsState();

      // Change settings
      settings.canvasSize = 0;
      settings.margin = 0;
      settings.time = 0;
      settings.animationSpeed = 0;

      restoreSettingsState(captured);

      expect(settings.canvasSize).toBe(1234);
      expect(settings.margin).toBe(56);
      expect(settings.time).toBe(7.8);
      expect(settings.animationSpeed).toBe(0.9);
    });
  });

  describe('applyScaledSettings', () => {
    it('sets canvasSize to scaledSize', () => {
      applyScaledSettings(2000, 2);
      expect(settings.canvasSize).toBe(2000);
    });

    it('multiplies margin by scaleFactor', () => {
      settings.margin = 50;
      applyScaledSettings(2000, 2);
      expect(settings.margin).toBe(100);
    });

    it('applies 4x scaling correctly', () => {
      settings.margin = 50;
      applyScaledSettings(4000, 4);
      expect(settings.canvasSize).toBe(4000);
      expect(settings.margin).toBe(200);
    });

    it('handles fractional scale factors', () => {
      settings.margin = 100;
      applyScaledSettings(500, 0.5);
      expect(settings.canvasSize).toBe(500);
      expect(settings.margin).toBe(50);
    });
  });

  describe('resetAnimationTime', () => {
    it('sets time to 0', () => {
      settings.time = 5;
      resetAnimationTime(1);
      expect(settings.time).toBe(0);
    });

    it('sets animationSpeed to provided value', () => {
      settings.animationSpeed = 2;
      resetAnimationTime(1.5);
      expect(settings.animationSpeed).toBe(1.5);
    });

    it('accepts different speed values', () => {
      resetAnimationTime(0.5);
      expect(settings.animationSpeed).toBe(0.5);

      resetAnimationTime(2);
      expect(settings.animationSpeed).toBe(2);
    });
  });
});
