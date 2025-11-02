import { settings } from '../config/settings.js';
import { getBackgroundColor, getColor } from './colors.js';
import { getContext } from './canvas.js';

function setFont(weight, size) {
  const ctx = getContext();
  ctx.font = `${weight} ${size}px Kario39C3`;
}

function getLogicalLength(text) {
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Check if it's the PUA character U+E002 (39C3 Logo)
    if (charCode === 0xE002) {
      length += 5;
    } else {
      length += 1;
    }
  }
  return length;
}

function measurePatternWidth(parts, fixedTextUpper, userText, fontSize) {
  const ctx = getContext();
  let totalWidth = 0;

  for (let i = 0; i < parts; i++) {
    const fixedMetrics = ctx.measureText(fixedTextUpper);
    let userWidth = 0;
    for (let j = 0; j < userText.length; j++) {
      userWidth += ctx.measureText(userText[j]).width;
    }
    totalWidth += fixedMetrics.width + userWidth;
  }

  return totalWidth;
}

function drawCCC(
  fixedText,
  fixedTextUpper,
  x,
  y,
  cccWeight,
  avgWeight,
  finalFontSize,
  lineIndex,
  globalCharIndex
) {
  const ctx = getContext();

  setFont(cccWeight, finalFontSize);
  ctx.fillStyle = getColor(globalCharIndex, lineIndex, settings.text.length, settings.time);
  ctx.fillText(fixedText, x, y);

  setFont(avgWeight, finalFontSize);
  const fixedMetrics = ctx.measureText(fixedTextUpper);

  return {
    width: fixedMetrics.width,
    charCount: fixedText.length,
  };
}

function drawUserText(
  userText,
  x,
  y,
  breatheWeight,
  avgWeight,
  finalFontSize,
  lineIndex,
  globalCharIndex
) {
  const ctx = getContext();
  let currentX = x;
  let charCount = 0;

  setFont(breatheWeight, finalFontSize);

  for (let charIndex = 0; charIndex < userText.length; charIndex++) {
    const char = userText[charIndex];
    ctx.fillStyle = getColor(
      globalCharIndex + charIndex,
      lineIndex,
      userText.length,
      settings.time
    );
    ctx.fillText(char, currentX, y);

    setFont(avgWeight, finalFontSize);
    const metrics = ctx.measureText(char);
    currentX += metrics.width;

    // Restore breathe weight for next character
    setFont(breatheWeight, finalFontSize);
    charCount++;
  }

  return {
    width: currentX - x,
    charCount: charCount,
  };
}

// Render CCC theme: <<CCC + UserInput + <<CCC + UserInput...
// <<CCC animates with font weight (wave), UserInput breathes (weight)
export function renderCCCTheme(canvas) {
  const ctx = getContext();

  ctx.fillStyle = getBackgroundColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const userText = settings.text;
  if (!userText) return;

  const fixedTextUpper = '<<CCC'; // Uppercase variant
  const fixedTextLower = '<<ccc'; // Lowercase variant
  const testSize = 1000;

  // Dynamically calculate pattern repetitions based on text length
  // Each pattern unit consists of: fixedText + userText (use uppercase for measurement)
  const patternUnitLength = fixedTextUpper.length + getLogicalLength(userText);
  const targetTotalChars = 36; // Target total characters per line for good readability
  const calculatedParts = Math.floor(targetTotalChars / patternUnitLength);

  // Clamp between min and max for reasonable bounds
  const minParts = 2;
  const maxParts = 5;
  const parts = Math.max(minParts, Math.min(maxParts, calculatedParts));

  // Measure max line width using average weight
  const avgWeight = (settings.minWeight + settings.maxWeight) / 2;
  setFont(avgWeight, testSize);
  const maxLineWidth = measurePatternWidth(parts, fixedTextUpper, userText, testSize);

  const maxTextHeight = testSize + (settings.numLines - 1) * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  // Calculate scaling
  const scaleFactor = Math.min(usableWidth / maxLineWidth, usableHeight / maxTextHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;
  const textBlockHeight = finalFontSize + (settings.numLines - 1) * lineSpacing;
  const topY = (settings.canvasSize - textBlockHeight) / 2 + settings.verticalOffset;
  const startY = topY + (settings.numLines - 1) * lineSpacing;

  ctx.textBaseline = 'top';

  for (let lineIndex = 0; lineIndex < settings.numLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;

    // Measure line width with average weight (fixed spacing)
    setFont(avgWeight, finalFontSize);
    const lineWidth = measurePatternWidth(parts, fixedTextUpper, userText, finalFontSize);

    // Center the line
    let x = (settings.canvasSize - lineWidth) / 2;

    const cccSpeed = 1.0; // Fixed animation speed for CCC
    const tCCC = settings.time * cccSpeed;

    // Wave animation for <<CCC (cycles through full weight range)
    const wave = Math.sin(tCCC);
    const cccWeight =
      settings.minWeight + ((wave + 1) / 2) * (settings.maxWeight - settings.minWeight);

    const tUser = settings.time * settings.animationSpeed;

    const breathe = Math.sin(tUser * 0.8);
    const breatheWeight =
      settings.minWeight + ((breathe + 1) / 2) * (settings.maxWeight - settings.minWeight);

    let globalCharIndex = 0;

    // Determine starting element based on line index
    // Even lines start with <<CCC, odd lines start with user text
    const startWithCCC = lineIndex % 2 === 0;

    // Draw the pattern
    for (let partIndex = 0; partIndex < parts; partIndex++) {
      // Alternate between <<CCC and <<ccc variants
      const fixedText = partIndex % 2 === 0 ? fixedTextUpper : fixedTextLower;

      if (startWithCCC) {
        // Draw <<CCC/<<ccc first, then user text
        const cccResult = drawCCC(
          fixedText,
          fixedTextUpper,
          x,
          y,
          cccWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex
        );
        x += cccResult.width;
        globalCharIndex += cccResult.charCount;

        const userResult = drawUserText(
          userText,
          x,
          y,
          breatheWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex
        );
        x += userResult.width;
        globalCharIndex += userResult.charCount;
      } else {
        // Draw user text first, then <<CCC/<<ccc
        const userResult = drawUserText(
          userText,
          x,
          y,
          breatheWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex
        );
        x += userResult.width;
        globalCharIndex += userResult.charCount;

        const cccResult = drawCCC(
          fixedText,
          fixedTextUpper,
          x,
          y,
          cccWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex
        );
        x += cccResult.width;
        globalCharIndex += cccResult.charCount;
      }
    }
  }
}
