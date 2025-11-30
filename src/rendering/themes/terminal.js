import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';

/**
 * Render Terminal Theme
 * Works with any renderer (Canvas or SVG)
 */
export function renderTerminalTheme(renderer, canvasSize) {
  renderer.clearCanvas(canvasSize, canvasSize, getBackgroundColor());

  const userText = settings.text;
  if (!userText) return;

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

    for (let i = 0; i < userText.length; i++) {
      width += renderer.measureText(userText[i], testSize, avgWeight);
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
  const textBlockHeight = finalFontSize + (numTerminalLines - 1) * lineSpacing;
  const topY = (settings.canvasSize - textBlockHeight) / 2 + settings.verticalOffset;
  const startY = topY + (numTerminalLines - 1) * lineSpacing;

  for (let lineIndex = 0; lineIndex < numTerminalLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing + finalFontSize;
    const template = lineTemplates[lineIndex % lineTemplates.length];

    let actualPrefix = template.prefix || '';
    if (template.prefixArray) {
      actualPrefix = template.prefixArray[lineIndex % template.prefixArray.length];
    }

    let animWeight;
    const linePhase = (lineIndex / numTerminalLines) * Math.PI * 2;
    switch (template.animStyle) {
      case 'pulse':
        const pulse = (Math.sin(t * 1 + linePhase) + 1) / 2;
        animWeight = settings.minWeight + pulse * (settings.maxWeight - settings.minWeight);
        break;
      case 'wave':
        const wave = (Math.sin(t * 1 + linePhase + Math.PI / 3) + 1) / 2;
        animWeight = settings.minWeight + wave * (settings.maxWeight - settings.minWeight);
        break;
      case 'breathe':
        const breathe = (Math.sin(t * 1 + linePhase + (Math.PI * 2) / 3) + 1) / 2;
        animWeight = settings.minWeight + breathe * (settings.maxWeight - settings.minWeight);
        break;
      default:
        animWeight = avgWeight;
    }

    // Measure actual line width
    let lineWidth = 0;
    if (actualPrefix) lineWidth += renderer.measureText(actualPrefix, finalFontSize, animWeight);
    if (template.logo) lineWidth += renderer.measureText(logo39C3, finalFontSize, animWeight);
    if (template.separator)
      lineWidth += renderer.measureText(template.separator, finalFontSize, animWeight);

    for (let i = 0; i < userText.length; i++) {
      const charPhase = (i / userText.length) * Math.PI * 2;
      const charWave = (Math.sin(t + charPhase + linePhase) + 1) / 2;
      const charWeight = settings.minWeight + charWave * (settings.maxWeight - settings.minWeight);
      lineWidth += renderer.measureText(userText[i], finalFontSize, charWeight);
    }

    if (template.afterText)
      lineWidth += renderer.measureText(template.afterText, finalFontSize, animWeight);
    if (template.suffix)
      lineWidth += renderer.measureText(template.suffix, finalFontSize, animWeight);

    let x = (settings.canvasSize - lineWidth) / 2;
    let charIndex = 0;

    if (actualPrefix) {
      const color = getColor(charIndex, lineIndex, userText.length + 10, settings.time);
      renderer.drawText(actualPrefix, x, y, finalFontSize, animWeight, color, {
        baseline: 'alphabetic',
      });
      x += renderer.measureText(actualPrefix, finalFontSize, animWeight);
      charIndex += actualPrefix.length;
    }

    if (template.logo) {
      const color = getColor(charIndex, lineIndex, userText.length + 10, settings.time);
      renderer.drawText(logo39C3, x, y, finalFontSize, animWeight, color, {
        baseline: 'alphabetic',
      });
      x += renderer.measureText(logo39C3, finalFontSize, animWeight);
      charIndex += 5;
    }

    if (template.separator) {
      const color = getColor(charIndex, lineIndex, userText.length + 10, settings.time);
      renderer.drawText(template.separator, x, y, finalFontSize, animWeight, color, {
        baseline: 'alphabetic',
      });
      x += renderer.measureText(template.separator, finalFontSize, animWeight);
      charIndex += template.separator.length;
    }

    const textWithSuffix = template.suffix ? userText + template.suffix : userText;
    const textWithAfterAndSuffix = template.afterText
      ? textWithSuffix + template.afterText
      : textWithSuffix;

    for (let i = 0; i < textWithAfterAndSuffix.length; i++) {
      const char = textWithAfterAndSuffix[i];
      const charPhase = (i / textWithAfterAndSuffix.length) * Math.PI * 2;
      const charWave = (Math.sin(t + charPhase + linePhase) + 1) / 2;
      const charWeight = settings.minWeight + charWave * (settings.maxWeight - settings.minWeight);

      const color = getColor(
        charIndex + i,
        lineIndex,
        textWithAfterAndSuffix.length + 10,
        settings.time
      );
      renderer.drawText(char, x, y, finalFontSize, charWeight, color, { baseline: 'alphabetic' });

      x += renderer.measureText(char, finalFontSize, charWeight);
    }
    charIndex += textWithAfterAndSuffix.length;
  }
}
