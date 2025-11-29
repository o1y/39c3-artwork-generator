import { parse } from 'opentype.js';
import fontUrl from '/fonts/Kario39C3VarWEB-Roman.woff?url';

let font = null;
let fontLoaded = false;
let loadPromise = null;

/**
 * Load the Kario39C3 variable font
 * @returns {Promise<opentype.Font>}
 */
export async function loadFont() {
  if (fontLoaded && font) {
    return font;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // Load the woff font file (opentype.js doesn't support woff2)
      const response = await fetch(fontUrl);
      const arrayBuffer = await response.arrayBuffer();
      font = parse(arrayBuffer);
      fontLoaded = true;
      return font;
    } catch (error) {
      console.error('Failed to load font:', error);
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Get the loaded font (must call loadFont first)
 * @returns {opentype.Font}
 */
export function getFont() {
  if (!font) {
    throw new Error('Font not loaded. Call loadFont() first.');
  }
  return font;
}

/**
 * Convert a text string to SVG path data at a specific weight and size
 * @param {string} text - The text to convert
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} fontSize - Font size in pixels
 * @param {number} weight - Font weight (10-100)
 * @returns {Object} Object containing path data and advance width
 */
export function textToPath(text, x, y, fontSize, weight) {
  if (!font) {
    throw new Error('Font not loaded. Call loadFont() first.');
  }

  // For variable fonts, we need to set the variation
  // Only use wght axis - wdth axis has bugs in opentype.js causing NaN values
  const variations = { wght: weight };

  // Get the path for the text with variation
  const path = font.getPath(text, x, y, fontSize, { features: {}, variation: variations });

  return {
    pathData: path.toPathData(),
    path: path,
    width: font.getAdvanceWidth(text, fontSize, { variation: variations })
  };
}

/**
 * Get the advance width of text at a specific weight and size
 * @param {string} text - The text to measure
 * @param {number} fontSize - Font size in pixels
 * @param {number} weight - Font weight (10-100)
 * @returns {number} Width in pixels
 */
export function getTextWidth(text, fontSize, weight) {
  if (!font) {
    throw new Error('Font not loaded. Call loadFont() first.');
  }

  const variations = { wght: weight };
  return font.getAdvanceWidth(text, fontSize, { variation: variations });
}

/**
 * Get individual character paths with their positions
 * @param {string} text - The text to convert
 * @param {number} startX - Starting X position
 * @param {number} y - Y position
 * @param {number} fontSize - Font size in pixels
 * @param {function} weightFn - Function that takes char index and returns weight
 * @param {function} colorFn - Function that takes char index and returns color
 * @returns {Array} Array of objects with pathData, color, and transform info
 */
export function textToCharacterPaths(text, startX, y, fontSize, weightFn, colorFn) {
  if (!font) {
    throw new Error('Font not loaded. Call loadFont() first.');
  }

  const characters = [];
  let currentX = startX;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const weight = weightFn(i);
    const color = colorFn(i);
    const variations = { wght: weight };

    const path = font.getPath(char, currentX, y, fontSize, { features: {}, variation: variations });
    const width = font.getAdvanceWidth(char, fontSize, { variation: variations });

    characters.push({
      char,
      pathData: path.toPathData(),
      color,
      x: currentX,
      y,
      width
    });

    currentX += width;
  }

  return characters;
}

/**
 * Check if font is loaded
 * @returns {boolean}
 */
export function isFontLoaded() {
  return fontLoaded;
}

/**
 * Get the middle baseline offset for a given font size
 * This is the Y offset needed to vertically center text
 * @param {number} fontSize - Font size in pixels
 * @returns {number} Offset in pixels
 */
export function getMiddleBaselineOffset(fontSize) {
  if (!font) {
    throw new Error('Font not loaded. Call loadFont() first.');
  }

  // Middle baseline is typically (ascender + descender) / 2
  // In OpenType coordinates, descender is usually negative
  const middleOffset = (font.ascender + font.descender) / 2;
  const scale = fontSize / font.unitsPerEm;
  return middleOffset * scale;
}
