import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';
import { getAscenderHeight, getDescenderHeight, getGlyphs } from '../../export/font-loader.js';
import {
  isToggleGlyph,
  calculateToggleWeight,
  TOGGLE_WIDTH,
  isCCCGlyph,
  calculateCCCWeight,
} from '../toggle-utils.js';

export function renderTerminalTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const userText = settings.text;
  if (!userText) return;

  const userGlyphs = getGlyphs(userText);

  const logo39C3 = '\uE002';
  const t = getNormalizedTime(settings.time);
  const avgWeight = (settings.minWeight + settings.maxWeight) / 2;

  const textHash = userText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const shuffleArray = (array, seed) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const hexAddressesBase = [
    '0xDEADBEEF',
    '0xCAFEBABE',
    '0xC0FFEE',
    '0x1337C0DE',
    '0xBAADF00D',
    '0xFEEDFACE',
    '0x8BADF00D',
    '0xDEADC0DE',
    '0xBEEFFACE',
    '0xABADCAFE',
    '0x0D15EA5E',
    '0xDEFEC8ED',
  ];

  const binaryNumbersBase = [
    '0b11010011',
    '0b10101010',
    '0b11110000',
    '0b00111100',
    '0b10011001',
    '0b01100110',
    '0b11001100',
    '0b00110011',
    '0b10110101',
    '0b01011010',
    '0b11100111',
    '0b00011000',
  ];

  const asmInstructionsBase = [
    'MOV',
    'JMP',
    'CALL',
    'PUSH',
    'POP',
    'ADD',
    'SUB',
    'XOR',
    'AND',
    'OR',
    'CMP',
    'LEA',
  ];

  const decoratorsBase = [
    '@inject',
    '@override',
    '@async',
    '@staticmethod',
    '@property',
    '@classmethod',
    '@dataclass',
    '@cached',
    '@debug',
    '@trace',
    '@deprecated',
    '@experimental',
  ];

  const shellCommandsBase = [
    '$> run --payload=',
    '$> exec --data=',
    '$> sudo exploit --target=',
    '$> ./hack --input=',
    '$> nmap --scan=',
    '$> chmod 777 ',
    '$> echo ',
    '$> cat /dev/',
    '$> netcat --port=',
    '$> curl -X POST ',
    '$> grep -r ',
    '$> python -c ',
  ];

  const hexAddresses = shuffleArray(hexAddressesBase, textHash);
  const binaryNumbers = shuffleArray(binaryNumbersBase, textHash + 1);
  const asmInstructions = shuffleArray(asmInstructionsBase, textHash + 2);
  const decorators = shuffleArray(decoratorsBase, textHash + 3);
  const shellCommands = shuffleArray(shellCommandsBase, textHash + 4);

  const lineTemplates = [
    { prefixArray: hexAddresses, separator: ' >> ', suffix: '', animStyle: 'pulse' },
    { prefix: '[', logo: true, suffix: '] exec(', afterText: ')', animStyle: 'wave' },
    { prefix: '/* === ', suffix: ' === */', animStyle: 'breathe' },
    { prefix: '>>> ', suffix: ' <<<', animStyle: 'pulse' },
    { prefixArray: shellCommands, suffix: '', animStyle: 'wave' },
    { prefix: '[OK] ', logo: true, separator: ' :: ', suffix: '', animStyle: 'breathe' },
    { prefixArray: binaryNumbers, separator: ' | ', suffix: '', animStyle: 'pulse' },
    { prefixArray: decorators, separator: ' ', suffix: '', animStyle: 'wave' },
    { prefix: ':: ', suffix: ' ::', animStyle: 'breathe' },
    { prefix: '=> ', suffix: ' <=', animStyle: 'pulse' },
    { prefixArray: asmInstructions, separator: ' ', suffix: ', AX', animStyle: 'wave' },
    { prefix: '#', logo: true, separator: ' | ', suffix: '', animStyle: 'pulse' },
  ];

  const testSize = 1000;
  const numTerminalLines = settings.numLines;

  let maxLineWidth = 0;
  for (let templateIndex = 0; templateIndex < lineTemplates.length; templateIndex++) {
    const template = lineTemplates[templateIndex];

    let prefixToTest = template.prefix || '';
    if (template.prefixArray) {
      prefixToTest = template.prefixArray.reduce((a, b) => (a.length > b.length ? a : b));
    }

    let width = 0;
    if (prefixToTest) width += renderer.measureText(prefixToTest, testSize, avgWeight);
    if (template.logo) width += renderer.measureText(logo39C3, testSize, avgWeight);
    if (template.separator) width += renderer.measureText(template.separator, testSize, avgWeight);

    for (let i = 0; i < userGlyphs.length; i++) {
      width += renderer.measureGlyph(userGlyphs[i], testSize, avgWeight);
    }

    if (template.afterText) width += renderer.measureText(template.afterText, testSize, avgWeight);
    if (template.suffix) width += renderer.measureText(template.suffix, testSize, avgWeight);

    maxLineWidth = Math.max(maxLineWidth, width);
  }

  const maxTextHeight = testSize + (numTerminalLines - 1) * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  const scaleFactor = Math.min(usableWidth / maxLineWidth, usableHeight / maxTextHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;

  const ascender = getAscenderHeight(finalFontSize);
  const descender = getDescenderHeight(finalFontSize); // negative value
  const textBlockHeight = (numTerminalLines - 1) * lineSpacing + ascender - descender;

  const topY = (settings.canvasSize - textBlockHeight) / 2;
  const startY = topY + ascender + (numTerminalLines - 1) * lineSpacing;

  for (let lineIndex = 0; lineIndex < numTerminalLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;
    const template = lineTemplates[lineIndex % lineTemplates.length];

    let actualPrefix = template.prefix || '';
    if (template.prefixArray) {
      actualPrefix = template.prefixArray[lineIndex % template.prefixArray.length];
    }

    let animWeight;
    const linePhase = (lineIndex / numTerminalLines) * Math.PI * 2;
    switch (template.animStyle) {
      case 'pulse': {
        const pulse = (Math.sin(t * 1 + linePhase) + 1) / 2;
        animWeight = settings.minWeight + pulse * (settings.maxWeight - settings.minWeight);
        break;
      }
      case 'wave': {
        const wave = (Math.sin(t * 1 + linePhase + Math.PI / 3) + 1) / 2;
        animWeight = settings.minWeight + wave * (settings.maxWeight - settings.minWeight);
        break;
      }
      case 'breathe': {
        const breathe = (Math.sin(t * 1 + linePhase + (Math.PI * 2) / 3) + 1) / 2;
        animWeight = settings.minWeight + breathe * (settings.maxWeight - settings.minWeight);
        break;
      }
      default:
        animWeight = avgWeight;
    }

    // Measure actual line width
    let lineWidth = 0;
    if (actualPrefix) lineWidth += renderer.measureText(actualPrefix, finalFontSize, animWeight);
    if (template.logo) lineWidth += renderer.measureText(logo39C3, finalFontSize, animWeight);
    if (template.separator)
      lineWidth += renderer.measureText(template.separator, finalFontSize, animWeight);

    for (let i = 0; i < userGlyphs.length; i++) {
      const glyphPhase = (i / userGlyphs.length) * Math.PI * 2;
      const glyphWave = (Math.sin(t + glyphPhase + linePhase) + 1) / 2;
      const glyphWeight =
        settings.minWeight + glyphWave * (settings.maxWeight - settings.minWeight);
      lineWidth += renderer.measureGlyph(userGlyphs[i], finalFontSize, glyphWeight);
    }

    if (template.afterText)
      lineWidth += renderer.measureText(template.afterText, finalFontSize, animWeight);
    if (template.suffix)
      lineWidth += renderer.measureText(template.suffix, finalFontSize, animWeight);

    let x = (settings.canvasSize - lineWidth) / 2;
    let charIndex = 0;

    if (actualPrefix) {
      const color = getColor(charIndex, lineIndex, settings.time);
      renderer.drawText(actualPrefix, x, y, finalFontSize, animWeight, color, {
        baseline: 'alphabetic',
      });
      x += renderer.measureText(actualPrefix, finalFontSize, animWeight);
      charIndex += actualPrefix.length;
    }

    if (template.logo) {
      const color = getColor(charIndex, lineIndex, settings.time);
      renderer.drawText(logo39C3, x, y, finalFontSize, animWeight, color, {
        baseline: 'alphabetic',
      });
      x += renderer.measureText(logo39C3, finalFontSize, animWeight);
      charIndex += 5;
    }

    if (template.separator) {
      const color = getColor(charIndex, lineIndex, settings.time);
      renderer.drawText(template.separator, x, y, finalFontSize, animWeight, color, {
        baseline: 'alphabetic',
      });
      x += renderer.measureText(template.separator, finalFontSize, animWeight);
      charIndex += template.separator.length;
    }

    const suffixGlyphs = template.suffix ? getGlyphs(template.suffix) : [];
    const afterTextGlyphs = template.afterText ? getGlyphs(template.afterText) : [];
    const allGlyphs = [...userGlyphs, ...suffixGlyphs, ...afterTextGlyphs];

    const isAnimated = settings.capabilities?.animated !== false;

    for (let i = 0; i < allGlyphs.length; i++) {
      const glyph = allGlyphs[i];
      const isToggle = isToggleGlyph(glyph);
      const isCCC = isCCCGlyph(glyph);

      // Toggle and CCC glyphs get special weight animation independent of weight settings
      let glyphWeight;
      if (isToggle) {
        glyphWeight = calculateToggleWeight(isAnimated);
      } else if (isCCC) {
        glyphWeight = calculateCCCWeight(isAnimated);
      } else {
        const glyphPhase = (i / allGlyphs.length) * Math.PI * 2;
        const glyphWave = (Math.sin(t + glyphPhase + linePhase) + 1) / 2;
        glyphWeight = settings.minWeight + glyphWave * (settings.maxWeight - settings.minWeight);
      }

      const color = getColor(charIndex + i, lineIndex, settings.time);
      const glyphOptions = isToggle
        ? { baseline: 'alphabetic', width: TOGGLE_WIDTH }
        : { baseline: 'alphabetic' };
      renderer.drawGlyph(glyph, x, y, finalFontSize, glyphWeight, color, glyphOptions);

      x += renderer.measureGlyph(
        glyph,
        finalFontSize,
        glyphWeight,
        isToggle ? TOGGLE_WIDTH : undefined
      );
    }
    charIndex += allGlyphs.length;
  }
}
