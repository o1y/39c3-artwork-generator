import { settings } from '../../config/settings.js';

let font = null;
const glyphStructureCache = new Map();

function analyzeGlyphStructure(glyphChar) {
  if (!font) {
    throw new Error('Font not loaded. Cannot analyze glyph structure.');
  }

  const glyph = font.charToGlyph(glyphChar);
  const glyphPath = glyph.getPath(0, 0, 1000, { variation: { wght: 50, wdth: 100 } });
  const commands = glyphPath.commands;

  const contourBounds = [];
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  let totalContours = 0;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    if (cmd.type === 'M') {
      if (totalContours > 0) {
        contourBounds.push({ minX, maxX, minY, maxY });
      }
      totalContours++;
      minX = maxX = cmd.x;
      minY = maxY = cmd.y;
    } else {
      if (cmd.x !== undefined) {
        minX = Math.min(minX, cmd.x);
        maxX = Math.max(maxX, cmd.x);
      }
      if (cmd.x1 !== undefined) {
        minX = Math.min(minX, cmd.x1);
        maxX = Math.max(maxX, cmd.x1);
      }
      if (cmd.x2 !== undefined) {
        minX = Math.min(minX, cmd.x2);
        maxX = Math.max(maxX, cmd.x2);
      }
      if (cmd.y !== undefined) {
        minY = Math.min(minY, cmd.y);
        maxY = Math.max(maxY, cmd.y);
      }
      if (cmd.y1 !== undefined) {
        minY = Math.min(minY, cmd.y1);
        maxY = Math.max(maxY, cmd.y1);
      }
      if (cmd.y2 !== undefined) {
        minY = Math.min(minY, cmd.y2);
        maxY = Math.max(maxY, cmd.y2);
      }
    }
  }
  contourBounds.push({ minX, maxX, minY, maxY });

  if (contourBounds.length < 2) {
    throw new Error(
      `Toggle glyph ${glyphChar} has unexpected structure: found ${contourBounds.length} contours, expected at least 2`
    );
  }

  let circleContourIndex = 0;
  let smallestWidth = Infinity;
  let circleBounds = null;
  contourBounds.forEach((bounds, idx) => {
    const width = bounds.maxX - bounds.minX;
    if (width < smallestWidth) {
      smallestWidth = width;
      circleContourIndex = idx + 1;
      circleBounds = bounds;
    }
  });

  let pillBounds = contourBounds[0];
  contourBounds.forEach((bounds) => {
    if (bounds.maxX - bounds.minX > pillBounds.maxX - pillBounds.minX) {
      pillBounds = bounds;
    }
  });

  const circleActualCenterX = (circleBounds.minX + circleBounds.maxX) / 2;
  const distanceFromRightEdge = pillBounds.maxX - circleActualCenterX;
  const circleTargetCenterX = pillBounds.minX + distanceFromRightEdge;
  const travelDistance = circleActualCenterX - circleTargetCenterX;

  return {
    circleContourIndex,
    travelDistance,
  };
}

export function setFont(loadedFont) {
  font = loadedFont;

  try {
    glyphStructureCache.set('\uE000', analyzeGlyphStructure('\uE000'));
    glyphStructureCache.set('\uE001', analyzeGlyphStructure('\uE001'));
  } catch (error) {
    console.warn('Failed to pre-analyze toggle glyphs:', error);
  }
}

export function getAnimatedTogglePath(glyphChar, x, y, fontSize, weight, circleProgress) {
  if (!font) {
    throw new Error('Font not loaded. Ensure loadFont() is called before using toggle glyphs.');
  }

  let structure = glyphStructureCache.get(glyphChar);
  if (!structure) {
    structure = analyzeGlyphStructure(glyphChar);
    glyphStructureCache.set(glyphChar, structure);
  }

  const variations = { wght: weight, wdth: settings.widthValue };
  const glyph = font.charToGlyph(glyphChar);
  const glyphPath = glyph.getPath(x, y, fontSize, { variation: variations });
  const commands = glyphPath.commands;

  const scale = fontSize / 1000;
  const circleOffset = -structure.travelDistance * scale * circleProgress;

  const pathParts = [];
  let contourIndex = 0;
  let isInCircle = false;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    if (cmd.type === 'M') {
      contourIndex++;
      isInCircle = contourIndex === structure.circleContourIndex;
    }

    const offsetX = isInCircle ? circleOffset : 0;

    switch (cmd.type) {
      case 'M':
        pathParts.push(`M ${cmd.x + offsetX} ${cmd.y}`);
        break;
      case 'L':
        pathParts.push(`L ${cmd.x + offsetX} ${cmd.y}`);
        break;
      case 'C':
        pathParts.push(
          `C ${cmd.x1 + offsetX} ${cmd.y1} ${cmd.x2 + offsetX} ${cmd.y2} ${cmd.x + offsetX} ${cmd.y}`
        );
        break;
      case 'Q':
        pathParts.push(`Q ${cmd.x1 + offsetX} ${cmd.y1} ${cmd.x + offsetX} ${cmd.y}`);
        break;
      case 'Z':
        pathParts.push('Z');
        break;
    }
  }

  return {
    pathData: pathParts.join(' '),
    width: font.getAdvanceWidth(glyphChar, fontSize, { variation: variations }),
  };
}
