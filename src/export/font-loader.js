import { parse } from 'opentype.js';
import fontUrl from '/fonts/Kario39C3VarWEB-Roman.woff?url';
import { settings } from '../config/settings.js';
import { setFont } from '../rendering/utils/toggle-glyph.js';

let font = null;
let loadPromise = null;

/**
 * Check if font is loaded and throw if not
 * @throws {Error} If font is not loaded
 */
function ensureFontLoaded() {
  if (!font) {
    throw new Error('Font not loaded. Call loadFont() first.');
  }
}

/**
 * Create variation object with weight, width, and optical size
 * @param {number} weight - Font weight (10-100)
 * @param {number} width - Font width (50-160), defaults to settings.widthValue
 * @param {number} opsz - Optical size / ascender and descenders (8-140), defaults to settings.opszValue
 * @returns {Object} Variation settings
 */
function createVariations(weight, width = settings.widthValue, opsz = settings.opszValue) {
  return { wght: weight, wdth: width, opsz: opsz };
}

/**
 * Load the Kario39C3 variable font
 * @returns {Promise<opentype.Font>}
 */
export async function loadFont() {
  if (font) {
    return font;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await fetch(fontUrl);
      const arrayBuffer = await response.arrayBuffer();
      font = parse(arrayBuffer);
      setFont(font);
      return font;
    } catch (error) {
      console.error('Failed to load font:', error);
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Convert a text string to SVG path data at a specific weight and size
 * @param {string} text - The text to convert
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} fontSize - Font size in pixels
 * @param {number} weight - Font weight (10-100)
 * @param {number} width - Font width (50-100), defaults to settings.widthValue
 * @returns {Object} Object containing path data and advance width
 */
export function textToPath(text, x, y, fontSize, weight, width = settings.widthValue) {
  ensureFontLoaded();

  const variations = createVariations(weight, width);
  const path = font.getPath(text, x, y, fontSize, { features: {}, variation: variations });

  return {
    pathData: path.toPathData({ flipY: false }),
    width: font.getAdvanceWidth(text, fontSize, { variation: variations }),
  };
}

/**
 * Get the advance width of text at a specific weight and size
 * @param {string} text - The text to measure
 * @param {number} fontSize - Font size in pixels
 * @param {number} weight - Font weight (10-100)
 * @param {number} width - Font width (50-100), defaults to settings.widthValue
 * @returns {number} Width in pixels
 */
export function getTextWidth(text, fontSize, weight, width = settings.widthValue) {
  ensureFontLoaded();

  const variations = createVariations(weight, width);
  return font.getAdvanceWidth(text, fontSize, { variation: variations });
}

/**
 * Get the middle baseline offset for a given font size
 * This is the Y offset needed to vertically center text
 * @param {number} fontSize - Font size in pixels
 * @returns {number} Offset in pixels
 */
export function getMiddleBaselineOffset(fontSize) {
  ensureFontLoaded();

  const middleOffset = (font.ascender + font.descender) / 2;
  const scale = fontSize / font.unitsPerEm;
  return middleOffset * scale;
}

/**
 * Get the ascender height for a given font size
 * This is the distance from baseline to top of capital letters
 * @param {number} fontSize - Font size in pixels
 * @returns {number} Ascender height in pixels
 */
export function getAscenderHeight(fontSize) {
  ensureFontLoaded();

  const scale = fontSize / font.unitsPerEm;
  return font.ascender * scale;
}

/**
 * Get the descender height for a given font size
 * This is the distance from baseline to bottom of descenders (negative value)
 * @param {number} fontSize - Font size in pixels
 * @returns {number} Descender height in pixels (negative)
 */
export function getDescenderHeight(fontSize) {
  ensureFontLoaded();

  const scale = fontSize / font.unitsPerEm;
  return font.descender * scale;
}

/**
 * Get the actual bounding box of a glyph/text
 * @param {string} text - The text to measure
 * @param {number} fontSize - Font size in pixels
 * @param {number} weight - Font weight (10-100)
 * @param {number} width - Font width (50-100), defaults to settings.widthValue
 * @returns {Object} Object with height, ascender (distance from top to baseline)
 */
export function getGlyphBounds(text, fontSize, weight, width = settings.widthValue) {
  ensureFontLoaded();

  const variations = createVariations(weight, width);
  const path = font.getPath(text, 0, 0, fontSize, { features: {}, variation: variations });
  const bbox = path.getBoundingBox();

  // bbox.y1 is the top (negative, above baseline), bbox.y2 is the bottom
  // For glyphs that sit on the baseline, y2 should be ~0
  return {
    height: bbox.y2 - bbox.y1,
    ascender: -bbox.y1, // distance from top of glyph to baseline
    top: bbox.y1,
    bottom: bbox.y2,
  };
}
