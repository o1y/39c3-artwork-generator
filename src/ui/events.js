import { settings } from '../config/settings.js';
import { exportPNG } from '../export/png.js';
import { exportVideo } from '../export/video.js';
import { applyColorTheme } from './theme.js';

export function initEventListeners() {
  document.getElementById('textInput').addEventListener('input', (e) => {
    settings.text = e.target.value.toUpperCase();
  });

  document.getElementById('themeSelect').addEventListener('change', (e) => {
    settings.theme = e.target.value;

    // Show/hide controls based on theme
    const linesControl = document.getElementById('linesControl');
    const widthControl = document.getElementById('widthControl');
    const modeControl = document.getElementById('modeControl');

    if (settings.theme === 'toggle') {
      linesControl.classList.add('hidden');
      widthControl.classList.remove('hidden');
      modeControl.classList.add('hidden'); // Toggle has custom animation
    } else if (settings.theme === 'ccc') {
      linesControl.classList.remove('hidden');
      widthControl.classList.add('hidden');
      modeControl.classList.add('hidden'); // CCC has custom animation
    } else {
      // 'lines' theme uses all controls
      linesControl.classList.remove('hidden');
      widthControl.classList.add('hidden');
      modeControl.classList.remove('hidden'); // Lines uses animation mode
    }
  });

  document.getElementById('speedSlider').addEventListener('input', (e) => {
    settings.animationSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = settings.animationSpeed.toFixed(1) + 'x';
  });

  document.getElementById('linesSlider').addEventListener('input', (e) => {
    settings.numLines = parseInt(e.target.value);
    document.getElementById('linesValue').textContent = settings.numLines;
  });

  document.getElementById('widthSlider').addEventListener('input', (e) => {
    settings.widthValue = parseInt(e.target.value);
    document.getElementById('widthValue').textContent = settings.widthValue;
  });

  document.getElementById('modeSelect').addEventListener('change', (e) => {
    settings.mode = e.target.value;
  });

  const colorSelect = document.getElementById('colorSelect');

  if (colorSelect) {
    colorSelect.addEventListener('change', (e) => {
      settings.colorMode = e.target.value;
      applyColorTheme(settings.colorMode);
    });
  }

  document.getElementById('exportToggleBtn').addEventListener('click', () => {
    const downloadSection = document.getElementById('downloadSection');
    const toggleBtn = document.getElementById('exportToggleBtn');

    downloadSection.classList.toggle('collapsed');
    toggleBtn.classList.toggle('active');
  });

  document.getElementById('exportFormat').addEventListener('change', (e) => {
    const durationControl = document.getElementById('durationControl');

    if (e.target.value === 'video') {
      durationControl.classList.remove('hidden');
    } else {
      durationControl.classList.add('hidden');
    }
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    const format = document.getElementById('exportFormat').value;

    if (format === 'png') {
      exportPNG();
    } else if (format === 'video') {
      exportVideo();
    }
  });
}

export function initDisplayValues() {
  document.getElementById('speedValue').textContent = settings.animationSpeed.toFixed(1) + 'x';
  document.getElementById('linesValue').textContent = settings.numLines;
  document.getElementById('widthValue').textContent = settings.widthValue;
  const colorSelect = document.getElementById('colorSelect');
  if (colorSelect) {
    colorSelect.value = settings.colorMode;
  }
  applyColorTheme(settings.colorMode);
}
