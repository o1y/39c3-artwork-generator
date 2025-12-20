/**
 * Fake Fax Export - A nostalgic trip to the 90s for 39C3 hackers
 */

import { getCanvas, getContext, setCanvas } from '../rendering/canvas.js';
import { render } from '../animation/loop.js';
import { createTempCanvas, cleanupTempCanvas } from './utils/canvas-manager.js';
import {
  captureSettingsState,
  restoreSettingsState,
  applyScaledSettings,
} from './utils/settings-state.js';
import { generateFilename, downloadCanvas } from './utils/download.js';

class FaxModemSound {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.masterGain = null;
  }

  init() {
    // @ts-ignore - webkitAudioContext for Safari compatibility
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

  // Dial tone: 350Hz + 440Hz continuous
  playDialTone(duration = 1) {
    const now = this.audioContext.currentTime;
    const t1 = this.createTone(350, 0.4);
    const t2 = this.createTone(440, 0.4);
    t1.osc.start(now);
    t2.osc.start(now);
    t1.osc.stop(now + duration);
    t2.osc.stop(now + duration);
  }

  // DTMF: Dual-tone multi-frequency
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

  // CED: Called station identification (2100Hz with phase reversals)
  playCEDTone() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 2100;
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = 0.4;

    // Phase reversals every 450ms (V.25 standard)
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.45;
      osc.frequency.setValueAtTime(2100, t);
      if (i % 2 === 1) {
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.setValueAtTime(0.4, t + 0.02);
      }
    }

    osc.start(now);
    osc.stop(now + 2.5);
    this.oscillators.push(osc);
  }

  // CNG: Calling fax tone (1100Hz, 0.5s on)
  playCNG() {
    const now = this.audioContext.currentTime;
    const t = this.createTone(1100, 0.5);
    t.osc.start(now);
    t.osc.stop(now + 0.5);
  }

  // V.21 Preamble: FSK modulation (1650Hz mark, 1850Hz space)
  playV21Preamble(startTime = 0) {
    const now = this.audioContext.currentTime + startTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = 0.35;

    // HDLC flags and DIS frame simulation
    const bitDuration = 0.0033; // 300 baud
    const pattern = [];
    // Generate ~200 bits of realistic FSK pattern
    for (let i = 0; i < 200; i++) {
      pattern.push(Math.random() > 0.5 ? 1 : 0);
    }

    pattern.forEach((bit, i) => {
      const freq = bit ? 1650 : 1850;
      osc.frequency.setValueAtTime(freq, now + i * bitDuration);
    });

    osc.start(now);
    osc.stop(now + pattern.length * bitDuration);
    this.oscillators.push(osc);
  }

  // TCF: Training Check Frame (1.5s of constant tone)
  playTCF(startTime = 0) {
    const now = this.audioContext.currentTime + startTime;
    const t = this.createTone(1800, 0.4);
    t.osc.start(now);
    t.osc.stop(now + 1.5);
  }

  // Training sequence: Modem synchronization
  playTraining(startTime = 0) {
    const now = this.audioContext.currentTime + startTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = 0.35;

    // Alternating tones for equalizer training
    const tones = [1200, 1800, 2400, 1800, 1200, 1800, 2400, 1800];
    tones.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
    });

    osc.start(now);
    osc.stop(now + tones.length * 0.15);
    this.oscillators.push(osc);
  }

  // Page transmission: Harsh fax screech sound
  playTransmission(startTime = 0, duration = 4) {
    const now = this.audioContext.currentTime + startTime;

    // Main carrier - rapid frequency switching like real QAM modulation
    const carrier = this.audioContext.createOscillator();
    const carrierGain = this.audioContext.createGain();
    carrier.type = 'sawtooth'; // Harsher than sine
    carrier.connect(carrierGain);
    carrierGain.connect(this.masterGain);
    carrierGain.gain.value = 0.15;

    // Simulate rapid symbol changes (V.29 uses 2400 baud)
    const symbolRate = 0.004; // ~250 symbols per second for audible effect
    for (let t = 0; t < duration; t += symbolRate) {
      // Jump between frequencies like real phase-shift keying
      const freqs = [1700, 1800, 1900, 2100, 2200, 2400];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      carrier.frequency.setValueAtTime(freq, now + t);
    }

    // High frequency screech component
    const screech = this.audioContext.createOscillator();
    const screechGain = this.audioContext.createGain();
    screech.type = 'square';
    screech.frequency.value = 2400;
    screech.connect(screechGain);
    screechGain.connect(this.masterGain);
    screechGain.gain.value = 0.06;

    // Modulate screech frequency for texture
    for (let t = 0; t < duration; t += 0.02) {
      const freq = 2400 + (Math.random() - 0.5) * 800;
      screech.frequency.setValueAtTime(freq, now + t);
    }

    // Low rumble for body
    const rumble = this.audioContext.createOscillator();
    const rumbleGain = this.audioContext.createGain();
    rumble.type = 'triangle';
    rumble.frequency.value = 600;
    rumble.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumbleGain.gain.value = 0.08;

    carrier.start(now);
    screech.start(now);
    rumble.start(now);
    carrier.stop(now + duration);
    screech.stop(now + duration);
    rumble.stop(now + duration);

    this.oscillators.push(carrier, screech, rumble);
  }

  // End of page: MCF (Message Confirmation) signal
  playEOP() {
    const now = this.audioContext.currentTime;
    // Three short 1500Hz beeps
    for (let i = 0; i < 3; i++) {
      const t = this.createTone(1500, 0.4);
      t.osc.start(now + i * 0.25);
      t.osc.stop(now + i * 0.25 + 0.15);
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
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

function applyThermalPaperEffect(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Convert to grayscale with increased contrast
  for (let i = 0; i < data.length; i += 4) {
    let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    gray = Math.max(0, Math.min(255, (gray - 128) * 1.4 + 128));
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Floyd-Steinberg dithering
  const pixels = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels[y * width + x] = data[(y * width + x) * 4];
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = pixels[idx];
      const newPixel = oldPixel > 128 ? 255 : 0;
      pixels[idx] = newPixel;
      const error = oldPixel - newPixel;

      if (x + 1 < width) pixels[idx + 1] += (error * 7) / 16;
      if (y + 1 < height) {
        if (x > 0) pixels[idx + width - 1] += (error * 3) / 16;
        pixels[idx + width] += (error * 5) / 16;
        if (x + 1 < width) pixels[idx + width + 1] += (error * 1) / 16;
      }
    }
  }

  // Apply thermal paper colors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;

      if (pixels[idx] > 128) {
        data[i] = 245 + Math.random() * 5;
        data[i + 1] = 240 + Math.random() * 5;
        data[i + 2] = 230 + Math.random() * 5;
      } else {
        const fade = 20 + Math.random() * 15;
        data[i] = fade;
        data[i + 1] = fade;
        data[i + 2] = fade + 5;
      }
    }
  }

  // Add vertical streaks
  for (let x = 0; x < width; x++) {
    if (Math.random() < 0.003) {
      const streakIntensity = 0.85 + Math.random() * 0.1;
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        data[i] = Math.floor(data[i] * streakIntensity);
        data[i + 1] = Math.floor(data[i + 1] * streakIntensity);
        data[i + 2] = Math.floor(data[i + 2] * streakIntensity);
      }
    }
  }

  // Add paper grain
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

// Fax Overlay UI

const FAX_MESSAGES = [
  // PSTN Layer
  { text: 'INITIALIZING FAX MODEM...', delay: 0 },
  { text: 'OFF HOOK', delay: 500, dialTone: true },
  { text: 'DIALING +494057308308181...', delay: 1500, dial: true },
  { text: 'RINGING...', delay: 3500 },
  { text: 'CALL CONNECTED', delay: 4500 },
  // Fax Layer
  { text: 'CNG: SENDING CALLING TONE', delay: 5000, cng: true },
  { text: 'CED: REMOTE FAX ANSWERED (2100Hz)', delay: 5800, ced: true },
  { text: 'V.21 PREAMBLE: HDLC FLAGS', delay: 8500, preamble: true },
  { text: 'DIS: RECEIVING CAPABILITIES', delay: 9300 },
  { text: 'DCS: V.17 14400bps, ECM, 200dpi', delay: 9800 },
  { text: 'TCF: TRAINING CHECK', delay: 10300, tcf: true },
  { text: 'CFR: READY TO RECEIVE', delay: 12000, training: true },
  { text: 'ENCRYPTION: ROT13 (DOUBLE)', delay: 13000, special: true },
  { text: 'TRANSMITTING PAGE 1/1...', delay: 13500, transmit: true },
  { text: 'EOP: END OF PAGE', delay: 18500 },
  { text: 'MCF: MESSAGE CONFIRMED', delay: 19000, eop: true },
  { text: 'DCN: DISCONNECT', delay: 19800 },
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
  if (baud) {
    overlay.querySelector('.fax-baud').textContent = `${baud} BPS`;
  }
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

      ctx.fillStyle = '#f5f0e6';
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

// Main Export Function

export async function exportFax(resolution = 2, callbacks = {}) {
  const { onStart, onProgress, onComplete } = callbacks;

  if (onStart) onStart();

  const overlay = createFaxOverlay();
  const modem = new FaxModemSound();

  try {
    modem.init();
  } catch {
    // Audio may not be available
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

  const thermalCanvas = document.createElement('canvas');
  thermalCanvas.width = tempCanvas.width;
  thermalCanvas.height = tempCanvas.height;
  thermalCanvas.getContext('2d').drawImage(tempCanvas, 0, 0);
  applyThermalPaperEffect(thermalCanvas);

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
        const number = '18002426722';
        for (let i = 0; i < number.length; i++) {
          setTimeout(() => {
            try {
              modem.playDTMF(number[i]);
            } catch {
              /* audio */
            }
          }, i * 180);
        }
      } else if (msg.cng) {
        updateFaxStatus(overlay, 'CNG');
        modem.playCNG();
      } else if (msg.ced) {
        updateFaxStatus(overlay, 'CED');
        modem.playCEDTone();
      } else if (msg.preamble) {
        updateFaxStatus(overlay, 'V.21 HDLC');
        modem.playV21Preamble();
      } else if (msg.tcf) {
        updateFaxStatus(overlay, 'TCF', baudRate);
        modem.playTCF();
      } else if (msg.training) {
        updateFaxStatus(overlay, 'TRAINING', baudRate);
        modem.playTraining();
      } else if (msg.transmit) {
        updateFaxStatus(overlay, 'TX PAGE 1', baudRate);
        modem.playTransmission(0, 4.5);
        await animatePaperFeed(overlay, thermalCanvas);
        if (onProgress) onProgress(90);
      } else if (msg.eop) {
        updateFaxStatus(overlay, 'MCF', baudRate);
        modem.playEOP();
      } else if (msg.text.includes('DCN')) {
        updateFaxStatus(overlay, 'STANDBY');
      }
    } catch {
      // Audio unavailable
    }

    messageIndex++;
    if (onProgress) {
      onProgress(Math.floor((messageIndex / FAX_MESSAGES.length) * 80));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const finalCanvas = document.createElement('canvas');
  const headerHeight = 60;
  finalCanvas.width = thermalCanvas.width;
  finalCanvas.height = thermalCanvas.height + headerHeight;
  const finalCtx = finalCanvas.getContext('2d');

  finalCtx.fillStyle = '#f5f0e6';
  finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  finalCtx.fillStyle = '#1a1a1a';
  finalCtx.font = `${Math.floor(thermalCanvas.width / 40)}px monospace`;
  const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
  finalCtx.fillText(`39C3 SECURE FAX    ${date}    PAGE 1/1`, 20, 25);
  finalCtx.fillText(`FROM: 8181 LOCAL TERMINAL    TO: 39C3-CHAOS-CC`, 20, 50);

  finalCtx.strokeStyle = '#1a1a1a';
  finalCtx.lineWidth = 2;
  finalCtx.setLineDash([5, 3]);
  finalCtx.beginPath();
  finalCtx.moveTo(10, headerHeight - 5);
  finalCtx.lineTo(finalCanvas.width - 10, headerHeight - 5);
  finalCtx.stroke();

  finalCtx.drawImage(thermalCanvas, 0, headerHeight);

  downloadCanvas(finalCanvas, 'png', generateFilename('fax.png'), () => {
    modem.stop();
    overlay.classList.add('fax-fade-out');
    setTimeout(() => {
      overlay.remove();
    }, 500);

    if (onComplete) onComplete();
  });
}
