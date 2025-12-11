import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';

function getLogicalLength(text) {
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // 39C3 logo glyph
    if (charCode === 0xe002) {
      length += 5;
    }
    // CCC logo glyphs (bold and thin)
    else if (charCode === 0xe003 || charCode === 0xe004) {
      length += 5; // CCC logos are about 5 characters wide
    } else {
      length += 1;
    }
  }
  return length;
}

function measurePatternWidth(
  renderer,
  parts,
  fixedTextUpper,
  userText,
  fontSize,
  avgWeight,
  width
) {
  let totalWidth = 0;

  for (let i = 0; i < parts; i++) {
    const fixedWidth = renderer.measureText(fixedTextUpper, fontSize, avgWeight, width);
    let userTextWidth = 0;
    for (let j = 0; j < userText.length; j++) {
      userTextWidth += renderer.measureText(userText[j], fontSize, avgWeight, width);
    }
    totalWidth += fixedWidth + userTextWidth;
  }

  return totalWidth;
}

function drawCCC(
  renderer,
  fixedText,
  fixedTextUpper,
  x,
  y,
  cccWeight,
  avgWeight,
  finalFontSize,
  lineIndex,
  globalCharIndex,
  width
) {
  const color = getColor(globalCharIndex, lineIndex, settings.time);
  renderer.drawText(fixedText, x, y, finalFontSize, cccWeight, color, {
    baseline: 'top',
    width,
  });

  const fixedWidth = renderer.measureText(fixedTextUpper, finalFontSize, avgWeight, width);

  return {
    width: fixedWidth,
    charCount: fixedText.length,
  };
}

function drawUserText(
  renderer,
  userText,
  x,
  y,
  breatheWeight,
  avgWeight,
  finalFontSize,
  lineIndex,
  globalCharIndex,
  width
) {
  let currentX = x;
  let charCount = 0;

  for (let charIndex = 0; charIndex < userText.length; charIndex++) {
    const char = userText[charIndex];
    const color = getColor(globalCharIndex + charIndex, lineIndex, settings.time);
    renderer.drawText(char, currentX, y, finalFontSize, breatheWeight, color, {
      baseline: 'top',
      width,
    });

    const charWidth = renderer.measureText(char, finalFontSize, avgWeight, width);
    currentX += charWidth;
    charCount++;
  }

  return {
    width: currentX - x,
    charCount: charCount,
  };
}

export function renderCCCTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const userText = settings.text;
  if (!userText) return;

  const fixedTextUpper = '\uE003'; // Bold CCC logo
  const fixedTextLower = '\uE004'; // Thin CCC logo
  const testSize = 1000;

  // Dynamically calculate pattern repetitions based on text length
  const patternUnitLength = getLogicalLength(fixedTextUpper) + getLogicalLength(userText);
  const targetTotalChars = 36;
  const calculatedParts = Math.floor(targetTotalChars / patternUnitLength);

  // Clamp between min and max for reasonable bounds
  const minParts = 2;
  const maxParts = 5;
  const parts = Math.max(minParts, Math.min(maxParts, calculatedParts));

  // Measure max line width using average weight
  const avgWeight = (settings.minWeight + settings.maxWeight) / 2;
  const userTextWidth = settings.widthValue;
  const maxLineWidth = measurePatternWidth(
    renderer,
    parts,
    fixedTextUpper,
    userText,
    testSize,
    avgWeight,
    userTextWidth
  );

  const maxTextHeight = testSize + (settings.numLines - 1) * testSize * settings.lineSpacingFactor;
  const usableWidth = settings.canvasSize - 2 * settings.margin;
  const usableHeight = settings.canvasSize - 2 * settings.margin;

  // Calculate scaling
  const scaleFactor = Math.min(usableWidth / maxLineWidth, usableHeight / maxTextHeight);
  const finalFontSize = testSize * scaleFactor;
  const lineSpacing = finalFontSize * settings.lineSpacingFactor;
  const textBlockHeight = finalFontSize + (settings.numLines - 1) * lineSpacing;
  const topY = (settings.canvasSize - textBlockHeight) / 2;
  const startY = topY + (settings.numLines - 1) * lineSpacing;

  for (let lineIndex = 0; lineIndex < settings.numLines; lineIndex++) {
    const y = startY - lineIndex * lineSpacing;

    // Measure line width with average weight (fixed spacing)
    const lineWidth = measurePatternWidth(
      renderer,
      parts,
      fixedTextUpper,
      userText,
      finalFontSize,
      avgWeight,
      userTextWidth
    );

    // Center the line
    let x = (settings.canvasSize - lineWidth) / 2;

    const t = getNormalizedTime(settings.time);

    // Wave animation for <<CCC (fixed weight range 10-100)
    const wave = Math.sin(t);
    const cccWeight = 10 + ((wave + 1) / 2) * 90;

    const breathe = -Math.sin(t);
    const breatheWeight =
      settings.minWeight + ((breathe + 1) / 2) * (settings.maxWeight - settings.minWeight);

    let globalCharIndex = 0;

    // Determine starting element based on line index
    const startWithCCC = lineIndex % 2 === 0;

    // Draw the pattern
    for (let partIndex = 0; partIndex < parts; partIndex++) {
      // Alternate between <<CCC and <<ccc variants
      const fixedText = partIndex % 2 === 0 ? fixedTextUpper : fixedTextLower;

      if (startWithCCC) {
        // Draw <<CCC/<<ccc first, then user text
        const cccResult = drawCCC(
          renderer,
          fixedText,
          fixedTextUpper,
          x,
          y,
          cccWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex,
          userTextWidth
        );
        x += cccResult.width;
        globalCharIndex += cccResult.charCount;

        const userResult = drawUserText(
          renderer,
          userText,
          x,
          y,
          breatheWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex,
          userTextWidth
        );
        x += userResult.width;
        globalCharIndex += userResult.charCount;
      } else {
        // Draw user text first, then <<CCC/<<ccc
        const userResult = drawUserText(
          renderer,
          userText,
          x,
          y,
          breatheWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex,
          userTextWidth
        );
        x += userResult.width;
        globalCharIndex += userResult.charCount;

        const cccResult = drawCCC(
          renderer,
          fixedText,
          fixedTextUpper,
          x,
          y,
          cccWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex,
          userTextWidth
        );
        x += cccResult.width;
        globalCharIndex += cccResult.charCount;
      }
    }
  }
}
