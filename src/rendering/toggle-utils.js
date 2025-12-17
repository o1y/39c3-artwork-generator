import { settings } from '../config/settings.js';
import { getNormalizedTime } from '../animation/timing.js';

// Toggle glyph unicodes from the Kario39C3VarWEB font
export const TOGGLE_UNICODES = [0xe000, 0xe001]; // outlined, filled

// Fixed width for toggle glyphs to maintain circular shape
export const TOGGLE_WIDTH = 100;

/**
 * Check if a glyph is a toggle glyph
 * @param {Object} glyph - Glyph object from opentype.js
 * @returns {boolean} - True if the glyph is a toggle
 */
export function isToggleGlyph(glyph) {
  return glyph && TOGGLE_UNICODES.includes(glyph.unicode);
}

/**
 * Easing function for smooth toggle switch animation
 */
function easeSwitch(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/**
 * Calculate toggle progress (0 to 1) for the switch animation
 * @param {boolean} isAnimated - Whether animation is enabled
 * @returns {number} - Progress value from 0 to 1
 */
export function calculateToggleProgress(isAnimated) {
  if (!isAnimated) return 1;

  const t = getNormalizedTime(settings.time);
  const rawProgress = (Math.sin(t) + 1) / 2;
  return easeSwitch(rawProgress);
}

/**
 * Calculate the weight for a toggle glyph to animate like a real switch
 * Weight 10 = circle on left, Weight 100 = circle on right
 * @param {boolean} isAnimated - Whether animation is enabled
 * @returns {number} - Weight value for the toggle glyph
 */
export function calculateToggleWeight(isAnimated = true) {
  const progress = calculateToggleProgress(isAnimated);
  // wght 10 = left position, wght 100 = right position
  return 100 - 90 * progress;
}
