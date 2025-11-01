import { settings } from '../config/settings.js';
import { exportPNG } from '../export/png.js';
import { exportVideo } from '../export/video.js';

export function initEventListeners() {
  document.getElementById('textInput').addEventListener('input', (e) => {
    settings.text = e.target.value.toUpperCase();
  });

  document.getElementById('themeSelect').addEventListener('change', (e) => {
    settings.theme = e.target.value;

    // Show/hide controls based on theme
    const linesControl = document.getElementById('linesControl');
    const widthControl = document.getElementById('widthControl');

    if (settings.theme === 'toggle') {
      linesControl.classList.add('hidden');
      widthControl.classList.remove('hidden');
    } else {
      linesControl.classList.remove('hidden');
      widthControl.classList.add('hidden');
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

  document.getElementById('colorSelect').addEventListener('change', (e) => {
    settings.colorMode = e.target.value;
  });

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
}
