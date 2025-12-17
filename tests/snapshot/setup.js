/**
 * Snapshot test setup - loads the actual font for rendering tests
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'opentype.js';
import { createCanvas } from '@napi-rs/canvas';

// Store the loaded font globally for tests
let testFont = null;

/**
 * Load the font from the filesystem (for Node.js tests)
 */
export function loadFontSync() {
  if (testFont) return testFont;

  const fontPath = join(process.cwd(), 'fonts', 'Kario39C3Var-Roman.ttf');
  const fontBuffer = readFileSync(fontPath);
  testFont = parse(fontBuffer.buffer);

  return testFont;
}

/**
 * Get the loaded font
 */
export function getTestFont() {
  if (!testFont) {
    loadFontSync();
  }
  return testFont;
}

/**
 * Inject the font into the font-loader module's internal state
 * This allows us to use the real rendering code with the test font
 */
export async function setupFontForTests() {
  const font = loadFontSync();
  return font;
}

/**
 * Create a Node.js compatible canvas for PNG rendering
 */
export function createTestCanvas(width, height) {
  return createCanvas(width, height);
}

/**
 * Create an SVG document (jsdom compatible)
 */
export function createSVGDocument(size) {
  const svg = global.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  return svg;
}

/**
 * Serialize an SVG element to string
 */
export function serializeSVG(svgElement) {
  const serializer = new (global.window.XMLSerializer || XMLSerializer)();
  return serializer.serializeToString(svgElement);
}

/**
 * Directory for storing snapshots
 */
export const SNAPSHOT_DIR = join(process.cwd(), 'tests', 'snapshot', '__snapshots__');

/**
 * Ensure snapshot directory exists
 */
export function ensureSnapshotDir() {
  if (!existsSync(SNAPSHOT_DIR)) {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

/**
 * Get snapshot file path for a test
 */
export function getSnapshotPath(testName, extension = 'svg') {
  return join(SNAPSHOT_DIR, `${testName}.${extension}`);
}

/**
 * Read existing snapshot or return null if doesn't exist
 */
export function readSnapshot(testName, extension = 'svg') {
  const snapshotPath = getSnapshotPath(testName, extension);
  if (existsSync(snapshotPath)) {
    return readFileSync(snapshotPath, 'utf-8');
  }
  return null;
}

/**
 * Write a new snapshot
 */
export function writeSnapshot(testName, content, extension = 'svg') {
  ensureSnapshotDir();
  const snapshotPath = getSnapshotPath(testName, extension);
  writeFileSync(snapshotPath, content);
}

/**
 * Compare SVG output with snapshot
 * Returns { match: boolean, diff?: string }
 */
export function compareSVGSnapshot(testName, svgString) {
  const existing = readSnapshot(testName, 'svg');

  if (existing === null) {
    // No snapshot exists - create it
    writeSnapshot(testName, svgString, 'svg');
    return { match: true, isNew: true };
  }

  // Normalize both strings for comparison (remove whitespace differences)
  const normalizeXML = (str) => str.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

  const normalizedExisting = normalizeXML(existing);
  const normalizedNew = normalizeXML(svgString);

  if (normalizedExisting === normalizedNew) {
    return { match: true };
  }

  return {
    match: false,
    expected: existing,
    actual: svgString,
  };
}

/**
 * Compare PNG canvas output with snapshot (using hash)
 */
export function comparePNGSnapshot(testName, canvas) {
  const pngBuffer = canvas.toBuffer('image/png');
  const pngBase64 = pngBuffer.toString('base64');

  const existing = readSnapshot(testName, 'png.b64');

  if (existing === null) {
    writeSnapshot(testName, pngBase64, 'png.b64');
    // Also save the actual PNG for visual inspection
    const pngPath = getSnapshotPath(testName, 'png');
    writeFileSync(pngPath, pngBuffer);
    return { match: true, isNew: true };
  }

  if (existing.trim() === pngBase64.trim()) {
    return { match: true };
  }

  // Save the new PNG for comparison
  const newPngPath = getSnapshotPath(testName + '.new', 'png');
  writeFileSync(newPngPath, pngBuffer);

  return {
    match: false,
    message: `PNG snapshot mismatch. New image saved to ${newPngPath}`,
  };
}
