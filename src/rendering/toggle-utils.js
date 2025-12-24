import { settings } from '../config/settings.js';
import { getNormalizedTime } from '../animation/timing.js';

// Toggle glyph unicodes from the Kario39C3VarWEB font
export const TOGGLE_UNICODES = [0xe000, 0xe001]; // outlined, filled

// CCC logo glyph unicodes (bold/thin variants)
export const CCC_UNICODES = [0xe003, 0xe004];

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
 * Check if a glyph is a CCC glyph (39C3 logo or CCC logos)
 * @param {Object} glyph - Glyph object from opentype.js
 * @returns {boolean} - True if the glyph is a CCC glyph
 */
export function isCCCGlyph(glyph) {
  return glyph && CCC_UNICODES.includes(glyph.unicode);
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
  if (!isAnimated) return 1 - settings.togglePosition;

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

/**
 * Calculate the weight for CCC glyphs with independent breathing animation
 * Uses full 10-100 weight range, independent of min/max weight settings
 * @param {boolean} isAnimated - Whether animation is enabled
 * @returns {number} - Weight value for the CCC glyph
 */
export function calculateCCCWeight(isAnimated = true) {
  if (!isAnimated) return 55; // Middle weight when static

  const t = getNormalizedTime(settings.time);
  const wave = Math.sin(t);
  // Full range 10-100, breathing animation
  return 10 + ((wave + 1) / 2) * 90;
}
