import { settings } from '../config/settings.js';
import { loadFont } from './font-loader.js';
import { generateFilename, downloadBlob } from './utils/download.js';
import { SVGRenderer } from '../rendering/core/svg-renderer.js';
import { renderLinesTheme } from '../rendering/themes/lines.js';
import { renderToggleTheme } from '../rendering/themes/toggle.js';
import { renderCCCTheme } from '../rendering/themes/ccc.js';
import { renderTerminalTheme } from '../rendering/themes/terminal.js';

export async function exportSVG() {
  await loadFont();

  const size = settings.canvasSize;
  const svg = createSVGDocument(size);
  const renderer = new SVGRenderer(svg);

  if (settings.theme.startsWith('toggle')) {
    renderToggleTheme(renderer, size);
  } else if (settings.theme === 'ccc') {
    renderCCCTheme(renderer, size);
  } else if (settings.theme === 'terminal') {
    renderTerminalTheme(renderer, size);
  } else {
    renderLinesTheme(renderer, size);
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });

  downloadBlob(blob, generateFilename('svg'));
}

function createSVGDocument(size) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  return svg;
}
