import { settings } from '../../config/settings.js';
import { getBackgroundColor, getColor } from '../colors.js';
import { getNormalizedTime } from '../../animation/timing.js';
import { getGlyphs } from '../../export/font-loader.js';

function getLogicalLength(glyphs) {
  let length = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const unicode = glyph.unicode;
    // 39C3 logo glyph
    if (unicode === 0xe002) {
      length += 5;
    }
    // CCC logo glyphs (bold and thin)
    else if (unicode === 0xe003 || unicode === 0xe004) {
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
  userGlyphs,
  fontSize,
  avgWeight,
  width
) {
  let totalWidth = 0;

  for (let i = 0; i < parts; i++) {
    const fixedWidth = renderer.measureText(fixedTextUpper, fontSize, avgWeight, width);
    let userTextWidth = 0;
    for (let j = 0; j < userGlyphs.length; j++) {
      userTextWidth += renderer.measureGlyph(userGlyphs[j], fontSize, avgWeight, width);
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
  userGlyphs,
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
  let glyphCount = 0;

  for (let glyphIndex = 0; glyphIndex < userGlyphs.length; glyphIndex++) {
    const glyph = userGlyphs[glyphIndex];
    const color = getColor(globalCharIndex + glyphIndex, lineIndex, settings.time);
    renderer.drawGlyph(glyph, currentX, y, finalFontSize, breatheWeight, color, {
      baseline: 'top',
      width,
    });

    const glyphWidth = renderer.measureGlyph(glyph, finalFontSize, avgWeight, width);
    currentX += glyphWidth;
    glyphCount++;
  }

  return {
    width: currentX - x,
    charCount: glyphCount,
  };
}

export function renderCCCTheme(renderer, canvasSize) {
  renderer.drawBackground(canvasSize, canvasSize, getBackgroundColor());

  const userText = settings.text;
  if (!userText) return;

  const userGlyphs = getGlyphs(userText);
  const fixedUpperGlyphs = getGlyphs('\uE003');
  const fixedTextUpper = '\uE003';
  const fixedTextLower = '\uE004';
  const testSize = 1000;

  // Dynamically calculate pattern repetitions based on text length
  const patternUnitLength = getLogicalLength(fixedUpperGlyphs) + getLogicalLength(userGlyphs);
  const targetTotalChars = 36;
  const calculatedParts = Math.floor(targetTotalChars / patternUnitLength);

  // Clamp between min and max for reasonable bounds
  const minParts = 2;
  const maxParts = 5;
  const parts = Math.max(minParts, Math.min(maxParts, calculatedParts));

  // Measure max line width using average weight
  const avgWeight = (settings.minWeight + settings.maxWeight) / 2;
  const userTextWidthSetting = settings.widthValue;
  const maxLineWidth = measurePatternWidth(
    renderer,
    parts,
    fixedTextUpper,
    userGlyphs,
    testSize,
    avgWeight,
    userTextWidthSetting
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
      userGlyphs,
      finalFontSize,
      avgWeight,
      userTextWidthSetting
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
          userTextWidthSetting
        );
        x += cccResult.width;
        globalCharIndex += cccResult.charCount;

        const userResult = drawUserText(
          renderer,
          userGlyphs,
          x,
          y,
          breatheWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex,
          userTextWidthSetting
        );
        x += userResult.width;
        globalCharIndex += userResult.charCount;
      } else {
        // Draw user text first, then <<CCC/<<ccc
        const userResult = drawUserText(
          renderer,
          userGlyphs,
          x,
          y,
          breatheWeight,
          avgWeight,
          finalFontSize,
          lineIndex,
          globalCharIndex,
          userTextWidthSetting
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
          userTextWidthSetting
        );
        x += cccResult.width;
        globalCharIndex += cccResult.charCount;
      }
    }
  }
}
