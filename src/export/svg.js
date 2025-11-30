import { settings } from '../config/settings.js';
import { loadFont } from './font-loader.js';
import { generateFilename } from './filename.js';
import { SVGRenderer } from '../rendering/core/svg-renderer.js';
import { renderLinesTheme } from '../rendering/themes/lines.js';
import { renderToggleTheme } from '../rendering/themes/toggle.js';
import { renderToggle39C3Theme } from '../rendering/themes/toggle39c3.js';
import { renderCCCTheme } from '../rendering/themes/ccc.js';
import { renderTerminalTheme } from '../rendering/themes/terminal.js';

/**
 * Export current frame as SVG with fonts converted to paths
 * SVG is resolution-independent, so we export at base canvas size
 */
export async function exportSVG() {
  // Ensure font is loaded
  await loadFont();

  const size = settings.canvasSize;
  const scaledMargin = settings.margin;

  // Create SVG document
  const svg = createSVGDocument(size);

  // Create SVG renderer
  const renderer = new SVGRenderer(svg);

  // Store original settings and scale them
  const originalCanvasSize = settings.canvasSize;
  const originalMargin = settings.margin;
  settings.canvasSize = size;
  settings.margin = scaledMargin;

  // Render based on theme using shared rendering functions
  try {
    if (settings.theme.startsWith('toggle39c3')) {
      renderToggle39C3Theme(renderer, size);
    } else if (settings.theme.startsWith('toggle')) {
      renderToggleTheme(renderer, size);
    } else if (settings.theme === 'ccc') {
      renderCCCTheme(renderer, size);
    } else if (settings.theme === 'terminal') {
      renderTerminalTheme(renderer, size);
    } else {
      renderLinesTheme(renderer, size);
    }
  } finally {
    // Restore original settings
    settings.canvasSize = originalCanvasSize;
    settings.margin = originalMargin;
  }

  // Convert to string and download
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = generateFilename('svg');
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Create SVG document element
 */
function createSVGDocument(size) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  return svg;
}
