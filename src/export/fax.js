/**
 * Fax Export - T.30 protocol simulation with thermal paper rendering
 */

import { jsPDF } from 'jspdf';
import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { render } from '../animation/loop.js';
import { createTempCanvas, cleanupTempCanvas } from './utils/canvas-manager.js';
import {
  captureSettingsState,
  restoreSettingsState,
  applyScaledSettings,
} from './utils/settings-state.js';
import { generateFilename } from './utils/download.js';
import { getCongressDay } from '../config/congress.js';

class FaxModemSound {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.masterGain = null;
  }

  init() {
    // @ts-ignore
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.12;
  }

  createTone(freq, gainValue = 0.5) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = gainValue;
    this.oscillators.push(osc);
    return { osc, gain };
  }

  playDialTone(duration = 1) {
    const now = this.audioContext.currentTime;
    const t1 = this.createTone(350, 0.4);
    const t2 = this.createTone(440, 0.4);
    t1.osc.start(now);
    t2.osc.start(now);
    t1.osc.stop(now + duration);
    t2.osc.stop(now + duration);
  }

  playDTMF(digit, duration = 0.12) {
    const freqs = {
      1: [697, 1209],
      2: [697, 1336],
      3: [697, 1477],
      4: [770, 1209],
      5: [770, 1336],
      6: [770, 1477],
      7: [852, 1209],
      8: [852, 1336],
      9: [852, 1477],
      0: [941, 1336],
      '*': [941, 1209],
      '#': [941, 1477],
    };
    const [low, high] = freqs[digit] || [697, 1209];
    const now = this.audioContext.currentTime;
    const t1 = this.createTone(low, 0.5);
    const t2 = this.createTone(high, 0.5);
    t1.osc.start(now);
    t2.osc.start(now);
    t1.osc.stop(now + duration);
    t2.osc.stop(now + duration);
  }

  // CED: 2100Hz with 180° phase reversals every 450ms (echo canceller disable)
  playCEDTone() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = 2100;
    osc.connect(gain);
    gain.connect(this.masterGain);

    for (let i = 0; i < 8; i++) {
      gain.gain.setValueAtTime(i % 2 === 0 ? 0.4 : -0.4, now + i * 0.45);
    }

    osc.start(now);
    osc.stop(now + 3.6);
    this.oscillators.push(osc);
  }

  // CNG: 1100Hz, 0.5s on, 3s cycle
  playCNG(repetitions = 1, startTime = 0) {
    const now = this.audioContext.currentTime + startTime;
    for (let i = 0; i < repetitions; i++) {
      const t = this.createTone(1100, 0.5);
      t.osc.start(now + i * 3.0);
      t.osc.stop(now + i * 3.0 + 0.5);
    }
    return repetitions * 3.0;
  }

  byteToLSBBits(byte) {
    const bits = [];
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1);
    return bits;
  }

  generateHDLCFrame(payloadBytes = []) {
    const FLAG = this.byteToLSBBits(0x7e);
    const bits = [];

    for (let i = 0; i < 10; i++) bits.push(...FLAG);
    bits.push(...this.byteToLSBBits(0xff)); // Address
    bits.push(...this.byteToLSBBits(0xc0)); // Control
    for (const byte of payloadBytes) bits.push(...this.byteToLSBBits(byte));
    for (let i = 0; i < 16; i++) bits.push(Math.random() > 0.5 ? 1 : 0); // FCS
    bits.push(...FLAG);

    return bits;
  }

  // V.21 FSK: mark=1650Hz, space=1850Hz, 300 baud
  playV21FSK(bits, startTime = 0) {
    const now = this.audioContext.currentTime + startTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = 0.35;

    const bitDuration = 1 / 300;
    bits.forEach((bit, i) => {
      osc.frequency.setValueAtTime(bit ? 1650 : 1850, now + i * bitDuration);
    });

    osc.start(now);
    osc.stop(now + bits.length * bitDuration);
    this.oscillators.push(osc);
    return bits.length * bitDuration;
  }

  playV21Preamble(startTime = 0) {
    const FLAG = this.byteToLSBBits(0x7e);
    const bits = [];
    for (let i = 0; i < 25; i++) bits.push(...FLAG);
    return this.playV21FSK(bits, startTime);
  }

  playDISFrame(startTime = 0) {
    return this.playV21FSK(this.generateHDLCFrame([0x01, 0x00, 0x46, 0x00]), startTime);
  }

  playDCSFrame(startTime = 0) {
    return this.playV21FSK(this.generateHDLCFrame([0x41, 0x00, 0x46, 0x00]), startTime);
  }

  playCFRFrame(startTime = 0) {
    return this.playV21FSK(this.generateHDLCFrame([0x21]), startTime);
  }

  playMCFFrame(startTime = 0) {
    return this.playV21FSK(this.generateHDLCFrame([0x31]), startTime);
  }

  playEOPFrame(startTime = 0) {
    return this.playV21FSK(this.generateHDLCFrame([0x2f]), startTime);
  }

  playDCNFrame(startTime = 0) {
    return this.playV21FSK(this.generateHDLCFrame([0x5f]), startTime);
  }

  // TCF: 1.5s of 1800Hz
  playTCF(startTime = 0) {
    const now = this.audioContext.currentTime + startTime;
    const t = this.createTone(1800, 0.4);
    t.osc.start(now);
    t.osc.stop(now + 1.5);
  }

  // V.17: 1800Hz carrier, 2400 baud with QAM-style modulation
  playTransmission(startTime = 0, duration = 4) {
    const now = this.audioContext.currentTime + startTime;
    const symbolDuration = 1 / 2400;

    const carrier = this.audioContext.createOscillator();
    const carrierGain = this.audioContext.createGain();
    carrier.type = 'sine';
    carrier.connect(carrierGain);
    carrierGain.connect(this.masterGain);

    for (let t = 0; t < duration; t += symbolDuration) {
      carrier.frequency.setValueAtTime(1800 + (Math.random() - 0.5) * 300, now + t);
      carrierGain.gain.setValueAtTime(0.2 + Math.random() * 0.1, now + t);
    }

    const harmonic = this.audioContext.createOscillator();
    const harmonicGain = this.audioContext.createGain();
    harmonic.type = 'sine';
    harmonic.frequency.value = 3600;
    harmonic.connect(harmonicGain);
    harmonicGain.connect(this.masterGain);
    harmonicGain.gain.value = 0.04;

    for (let t = 0; t < duration; t += symbolDuration * 2) {
      harmonic.frequency.setValueAtTime(3600 + (Math.random() - 0.5) * 200, now + t);
    }

    const baseband = this.audioContext.createOscillator();
    const basebandGain = this.audioContext.createGain();
    baseband.type = 'triangle';
    baseband.frequency.value = 600;
    baseband.connect(basebandGain);
    basebandGain.connect(this.masterGain);
    basebandGain.gain.value = 0.05;

    const noiseBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * duration,
      this.audioContext.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.02;
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = this.audioContext.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseGain.gain.value = 0.15;

    carrier.start(now);
    harmonic.start(now);
    baseband.start(now);
    noise.start(now);
    carrier.stop(now + duration);
    harmonic.stop(now + duration);
    baseband.stop(now + duration);
    noise.stop(now + duration);

    this.oscillators.push(carrier, harmonic, baseband);
  }

  playLocalConfirmationBeeps() {
    const now = this.audioContext.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = this.createTone(1500, 0.3);
      t.osc.start(now + i * 0.25);
      t.osc.stop(now + i * 0.25 + 0.12);
    }
  }

  stop() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    });
    this.oscillators = [];
    if (this.audioContext) this.audioContext.close();
  }
}

const FAX_WIDTH = 1728; // ITU-T T.4 standard
const MARGIN_PERCENT = 0.05; // Page margin for content

function applyThermalPaperEffect(canvas) {
  const ctx = canvas.getContext('2d');
  const origWidth = canvas.width;
  const origHeight = canvas.height;

  // Downsample to fax resolution
  const faxHeight = Math.round((FAX_WIDTH / origWidth) * origHeight);
  const faxCanvas = document.createElement('canvas');
  faxCanvas.width = FAX_WIDTH;
  faxCanvas.height = faxHeight;
  const faxCtx = faxCanvas.getContext('2d');

  const marginPx = Math.round(FAX_WIDTH * MARGIN_PERCENT);
  const contentWidth = FAX_WIDTH - marginPx * 2;

  faxCtx.fillStyle = '#ffffff';
  faxCtx.fillRect(0, 0, FAX_WIDTH, faxHeight);
  faxCtx.drawImage(canvas, marginPx, 0, contentWidth, faxHeight);

  // Grayscale + contrast
  const imageData = faxCtx.getImageData(0, 0, FAX_WIDTH, faxHeight);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    gray = Math.max(0, Math.min(255, (gray - 128) * 1.4 + 128));
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Floyd-Steinberg dithering
  const pixels = new Float32Array(FAX_WIDTH * faxHeight);
  for (let y = 0; y < faxHeight; y++) {
    for (let x = 0; x < FAX_WIDTH; x++) {
      pixels[y * FAX_WIDTH + x] = data[(y * FAX_WIDTH + x) * 4];
    }
  }

  for (let y = 0; y < faxHeight; y++) {
    for (let x = 0; x < FAX_WIDTH; x++) {
      const idx = y * FAX_WIDTH + x;
      const oldPixel = pixels[idx];
      const newPixel = oldPixel > 128 ? 255 : 0;
      pixels[idx] = newPixel;
      const error = oldPixel - newPixel;

      if (x + 1 < FAX_WIDTH) pixels[idx + 1] += (error * 7) / 16;
      if (y + 1 < faxHeight) {
        if (x > 0) pixels[idx + FAX_WIDTH - 1] += (error * 3) / 16;
        pixels[idx + FAX_WIDTH] += (error * 5) / 16;
        if (x + 1 < FAX_WIDTH) pixels[idx + FAX_WIDTH + 1] += (error * 1) / 16;
      }
    }
  }

  // Row jitter
  const rowJitter = new Int8Array(faxHeight);
  for (let y = 0; y < faxHeight; y++) {
    if (Math.random() < 0.015) {
      rowJitter[y] = Math.floor(Math.random() * 5) - 2;
    } else if (y > 0) {
      rowJitter[y] = rowJitter[y - 1];
    }
  }

  // Apply thermal colors with jitter
  for (let y = 0; y < faxHeight; y++) {
    const jitter = rowJitter[y];
    for (let x = 0; x < FAX_WIDTH; x++) {
      const srcX = Math.max(0, Math.min(FAX_WIDTH - 1, x - jitter));
      const i = (y * FAX_WIDTH + x) * 4;

      if (pixels[y * FAX_WIDTH + srcX] > 128) {
        data[i] = 250 + Math.random() * 5;
        data[i + 1] = 250 + Math.random() * 5;
        data[i + 2] = 250 + Math.random() * 5;
      } else {
        const fade = 20 + Math.random() * 15;
        data[i] = fade;
        data[i + 1] = fade;
        data[i + 2] = fade + 5;
      }
    }
  }

  // Vertical streaks
  for (let x = 0; x < FAX_WIDTH; x++) {
    if (Math.random() < 0.003) {
      const intensity = 0.85 + Math.random() * 0.1;
      for (let y = 0; y < faxHeight; y++) {
        const i = (y * FAX_WIDTH + x) * 4;
        data[i] = Math.floor(data[i] * intensity);
        data[i + 1] = Math.floor(data[i + 1] * intensity);
        data[i + 2] = Math.floor(data[i + 2] * intensity);
      }
    }
  }

  // Perforation line on left edge (tear-off mark)
  const perfX = Math.floor(marginPx * 0.4);
  const dashLength = 8;
  const gapLength = 6;
  for (let y = 0; y < faxHeight; y++) {
    const inDash = y % (dashLength + gapLength) < dashLength;
    if (inDash) {
      const i = (y * FAX_WIDTH + perfX) * 4;
      data[i] = data[i + 1] = data[i + 2] = 180; // Light gray dash
    }
  }

  // Paper grain
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }

  faxCtx.putImageData(imageData, 0, 0);

  // Global skew (crooked paper feed)
  const skewAngle = (Math.random() * 0.5 + 0.3) * (Math.random() > 0.5 ? 1 : -1);
  const skewRad = (skewAngle * Math.PI) / 180;

  // Calculate expanded canvas size to prevent clipping during rotation
  const cosA = Math.cos(Math.abs(skewRad));
  const sinA = Math.sin(Math.abs(skewRad));
  const expandedWidth = Math.ceil(FAX_WIDTH * cosA + faxHeight * sinA);
  const expandedHeight = Math.ceil(faxHeight * cosA + FAX_WIDTH * sinA);

  const skewCanvas = document.createElement('canvas');
  skewCanvas.width = expandedWidth;
  skewCanvas.height = expandedHeight;
  const skewCtx = skewCanvas.getContext('2d');

  skewCtx.fillStyle = '#ffffff';
  skewCtx.fillRect(0, 0, expandedWidth, expandedHeight);
  skewCtx.translate(expandedWidth / 2, expandedHeight / 2);
  skewCtx.rotate(skewRad);
  skewCtx.translate(-FAX_WIDTH / 2, -faxHeight / 2);
  skewCtx.drawImage(faxCanvas, 0, 0);

  // Nearest-neighbor upsample
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, origWidth, origHeight);
  ctx.drawImage(skewCanvas, 0, 0, origWidth, origHeight);
  ctx.imageSmoothingEnabled = true;
}

const FAX_NUMBER = '04057308308181';
const FAX_NUMBER_DISPLAY = '+49 40 5730 830 8181';

const FAX_MESSAGES = [
  { text: 'INITIALIZING FAX MODEM...', delay: 0 },
  { text: 'OFF HOOK', delay: 500, dialTone: true },
  { text: `DIALING ${FAX_NUMBER_DISPLAY}...`, delay: 1500, dial: true },
  { text: 'RINGING...', delay: 3500 },
  { text: 'CNG: SENDING CALLING TONE (1100Hz)', delay: 4000, cng: true },
  { text: 'CNG: ...', delay: 7000 },
  { text: 'CALL CONNECTED', delay: 9500 },
  { text: 'CED: REMOTE FAX ANSWERED (2100Hz)', delay: 10000, ced: true },
  { text: 'V.21 PREAMBLE: HDLC FLAGS (0x7E)', delay: 14000, preamble: true },
  { text: 'DIS: RECEIVING CAPABILITIES', delay: 14800, dis: true },
  { text: 'DCS: V.17 14400bps, ECM, 200dpi', delay: 15600, dcs: true },
  { text: 'TCF: TRAINING CHECK (1.5s)', delay: 16400, tcf: true },
  { text: 'CFR: CONFIRMATION TO RECEIVE', delay: 18100, cfr: true },
  { text: 'ENCRYPTION: ROT13 (DOUBLE)', delay: 18700, special: true },
  { text: 'TRANSMITTING PAGE 1/1...', delay: 19200, transmit: true },
  { text: 'EOP: END OF PROCEDURE', delay: 24200, eop: true },
  { text: 'MCF: MESSAGE CONFIRMATION', delay: 25000, mcf: true },
  { text: 'DCN: DISCONNECT', delay: 25800, dcn: true },
];

function createFaxOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'fax-overlay';
  overlay.innerHTML = `
    <div class="fax-crt">
      <div class="fax-scanlines"></div>
      <div class="fax-content">
        <div class="fax-header">
          <pre class="fax-ascii">
┌──────────────────────────────────────────────────┐
│                                                  │
│    ████████   ████████    █████████   ████████   │
│   ███░░░░███ ███░░░░███  ███░░░░░███ ███░░░░███  │
│  ░░░    ░███░███   ░███ ███     ░░░ ░░░    ░███  │
│     ██████░ ░░█████████░███            ██████░   │
│    ░░░░░░███ ░░░░░░░███░███           ░░░░░░███  │
│   ███   ░███ ███   ░███░░███     ███ ███   ░███  │
│  ░░████████ ░░████████  ░░█████████ ░░████████   │
│   ░░░░░░░░   ░░░░░░░░    ░░░░░░░░░   ░░░░░░░░    │
│                                                  │
│     39C3 SECURE TRANSMISSION PROTOCOL v3.9       │
│                                                  │
└──────────────────────────────────────────────────┘</pre>
        </div>
        <div class="fax-terminal">
          <div class="fax-log"></div>
          <div class="fax-cursor">█</div>
        </div>
        <div class="fax-preview">
          <div class="fax-paper">
            <canvas id="fax-preview-canvas"></canvas>
          </div>
        </div>
        <div class="fax-footer">
          <span class="fax-status">STANDBY</span>
          <span class="fax-baud">------ BPS</span>
        </div>
      </div>
      <div class="fax-vignette"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function updateFaxLog(overlay, message, isSpecial = false) {
  const terminal = overlay.querySelector('.fax-terminal');
  const log = overlay.querySelector('.fax-log');
  const line = document.createElement('div');
  line.className = 'fax-line' + (isSpecial ? ' fax-special' : '');
  const timestamp = new Date().toISOString().slice(11, 19);
  line.innerHTML = `<span class="fax-time">[${timestamp}]</span> ${message}`;
  log.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function updateFaxStatus(overlay, status, baud = null) {
  overlay.querySelector('.fax-status').textContent = status;
  if (baud) overlay.querySelector('.fax-baud').textContent = `${baud} BPS`;
}

function animatePaperFeed(overlay, thermalCanvas) {
  return new Promise((resolve) => {
    const previewCanvas = overlay.querySelector('#fax-preview-canvas');
    const paper = overlay.querySelector('.fax-paper');

    const maxWidth = Math.min(400, window.innerWidth - 60);
    const scale = maxWidth / thermalCanvas.width;
    previewCanvas.width = thermalCanvas.width * scale;
    previewCanvas.height = thermalCanvas.height * scale;

    const ctx = previewCanvas.getContext('2d');
    const duration = 4000;
    const startTime = performance.now();
    paper.style.display = 'block';

    function animate(currentTime) {
      const progress = Math.min(1, (currentTime - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const visibleHeight = Math.floor(thermalCanvas.height * eased);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

      if (visibleHeight > 0) {
        ctx.drawImage(
          thermalCanvas,
          0,
          0,
          thermalCanvas.width,
          visibleHeight,
          0,
          0,
          previewCanvas.width,
          visibleHeight * scale
        );
      }

      paper.style.transform = `translateY(${(1 - eased) * 50}px)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

export async function exportFax(resolution = 2, callbacks = {}) {
  const { onStart, onProgress, onComplete } = callbacks;
  if (onStart) onStart();

  const overlay = createFaxOverlay();
  const modem = new FaxModemSound();

  try {
    modem.init();
  } catch {
    // Audio unavailable
  }

  const originalCanvas = getCanvas();
  const originalCtx = getContext();
  const settingsState = captureSettingsState();
  const {
    canvas: tempCanvas,
    context: tempCtx,
    scaledSize,
  } = createTempCanvas(resolution, true, false);

  applyScaledSettings(scaledSize, resolution);
  setCanvas(tempCanvas, tempCtx);
  render();

  const a4AspectRatio = 297 / 210;
  const a4CanvasWidth = tempCanvas.width;
  const a4CanvasHeight = Math.round(a4CanvasWidth * a4AspectRatio);

  const a4Canvas = document.createElement('canvas');
  a4Canvas.width = a4CanvasWidth;
  a4Canvas.height = a4CanvasHeight;
  const a4Ctx = a4Canvas.getContext('2d');

  a4Ctx.fillStyle = '#ffffff';
  a4Ctx.fillRect(0, 0, a4CanvasWidth, a4CanvasHeight);

  const marginX = Math.round(a4CanvasWidth * MARGIN_PERCENT);
  const marginY = Math.round(a4CanvasHeight * MARGIN_PERCENT);
  const headerHeight = Math.round(a4CanvasHeight * 0.04);
  const contentWidth = a4CanvasWidth - marginX * 2;

  a4Ctx.fillStyle = '#1a1a1a';
  a4Ctx.font = `${Math.floor(a4CanvasWidth / 45)}px monospace`;
  const now = new Date();
  const date = now.toISOString().slice(0, 19) + 'Z';
  const congressDay = getCongressDay(now);
  a4Ctx.fillText(
    `39C3 SECURE FAX    ${congressDay}    ${date}    PAGE 1/1`,
    marginX,
    marginY + headerHeight * 0.4
  );
  a4Ctx.fillText(
    `FROM: 39C3.o1y.de LOCAL TERMINAL    TO: 39C3`,
    marginX,
    marginY + headerHeight * 0.8
  );

  a4Ctx.strokeStyle = '#1a1a1a';
  a4Ctx.lineWidth = 2;
  a4Ctx.setLineDash([5, 3]);
  a4Ctx.beginPath();
  a4Ctx.moveTo(marginX, marginY + headerHeight);
  a4Ctx.lineTo(a4CanvasWidth - marginX, marginY + headerHeight);
  a4Ctx.stroke();
  a4Ctx.setLineDash([]);

  const artworkY = marginY + headerHeight + 10;
  const availableHeight = a4CanvasHeight - artworkY - marginY;
  const artworkAspect = tempCanvas.height / tempCanvas.width;
  let artworkWidth = contentWidth;
  let artworkHeight = artworkWidth * artworkAspect;

  if (artworkHeight > availableHeight) {
    artworkHeight = availableHeight;
    artworkWidth = artworkHeight / artworkAspect;
  }

  const artworkX = marginX + (contentWidth - artworkWidth) / 2;
  a4Ctx.drawImage(tempCanvas, artworkX, artworkY, artworkWidth, artworkHeight);

  applyThermalPaperEffect(a4Canvas);

  const thermalCanvas = a4Canvas;

  setCanvas(originalCanvas, originalCtx);
  restoreSettingsState(settingsState);
  cleanupTempCanvas(tempCanvas);

  let messageIndex = 0;
  const baudRate = 14400;

  for (const msg of FAX_MESSAGES) {
    await new Promise((resolve) =>
      setTimeout(resolve, msg.delay - (messageIndex > 0 ? FAX_MESSAGES[messageIndex - 1].delay : 0))
    );

    updateFaxLog(overlay, msg.text, msg.special);

    try {
      if (msg.dialTone) {
        updateFaxStatus(overlay, 'OFF HOOK');
        modem.playDialTone(0.8);
      } else if (msg.dial) {
        updateFaxStatus(overlay, 'DIALING');
        for (let i = 0; i < FAX_NUMBER.length; i++) {
          setTimeout(() => {
            try {
              modem.playDTMF(FAX_NUMBER[i]);
            } catch {
              /* ignore */
            }
          }, i * 180);
        }
      } else if (msg.cng) {
        updateFaxStatus(overlay, 'CNG');
        modem.playCNG(2);
      } else if (msg.ced) {
        updateFaxStatus(overlay, 'CED');
        modem.playCEDTone();
      } else if (msg.preamble) {
        updateFaxStatus(overlay, 'V.21 HDLC');
        modem.playV21Preamble();
      } else if (msg.dis) {
        updateFaxStatus(overlay, 'DIS', 300);
        modem.playDISFrame();
      } else if (msg.dcs) {
        updateFaxStatus(overlay, 'DCS', 300);
        modem.playDCSFrame();
      } else if (msg.tcf) {
        updateFaxStatus(overlay, 'TCF', baudRate);
        modem.playTCF();
      } else if (msg.cfr) {
        updateFaxStatus(overlay, 'CFR', 300);
        modem.playCFRFrame();
      } else if (msg.transmit) {
        updateFaxStatus(overlay, 'TX PAGE 1', baudRate);
        modem.playTransmission(0, 4.5);
        await animatePaperFeed(overlay, thermalCanvas);
        if (onProgress) onProgress(90);
      } else if (msg.eop) {
        updateFaxStatus(overlay, 'EOP', 300);
        modem.playEOPFrame();
      } else if (msg.mcf) {
        updateFaxStatus(overlay, 'MCF', 300);
        modem.playMCFFrame();
        setTimeout(() => modem.playLocalConfirmationBeeps(), 300);
      } else if (msg.dcn) {
        updateFaxStatus(overlay, 'DCN', 300);
        modem.playDCNFrame();
        setTimeout(() => updateFaxStatus(overlay, 'STANDBY'), 500);
      }
    } catch {
      // Audio unavailable
    }

    messageIndex++;
    if (onProgress) onProgress(Math.floor((messageIndex / FAX_MESSAGES.length) * 80));
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(thermalCanvas, 'PNG', 0, 0, 210, 297);
  pdf.save(generateFilename('fax.pdf'));

  modem.stop();
  overlay.classList.add('fax-fade-out');
  setTimeout(() => overlay.remove(), 500);
  if (onComplete) onComplete();
}
