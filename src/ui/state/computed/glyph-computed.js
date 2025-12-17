import { getAllGlyphs } from '../../../export/font-loader.js';

const SPECIAL_UNICODES = [0xe002, 0xe000, 0xe001, 0xe003, 0xe004];

const isAccentedLetter = (unicode) =>
  (unicode >= 0xc0 && unicode <= 0xff && unicode !== 0xd7 && unicode !== 0xf7) ||
  (unicode >= 0x100 && unicode <= 0x24f);

const isSymbol = (unicode) =>
  (unicode >= 0x2190 && unicode <= 0x21ff) ||
  (unicode >= 0x20a0 && unicode <= 0x20cf) ||
  unicode === 0xa2 ||
  unicode === 0xa3 ||
  unicode === 0xa4 ||
  unicode === 0xa5 ||
  unicode === 0x24;

const isNumeral = (unicode) =>
  (unicode >= 0x30 && unicode <= 0x39) ||
  (unicode >= 0x2150 && unicode <= 0x218f) ||
  (unicode >= 0xbc && unicode <= 0xbe) ||
  unicode === 0xb9 ||
  unicode === 0xb2 ||
  unicode === 0xb3 ||
  (unicode >= 0x2070 && unicode <= 0x2079) ||
  (unicode >= 0x2080 && unicode <= 0x2089);

const isBasicLetter = (unicode) =>
  (unicode >= 0x41 && unicode <= 0x5a) || (unicode >= 0x61 && unicode <= 0x7a);

const GLYPH_CATEGORIES = [
  { name: 'Special', filter: (glyph) => SPECIAL_UNICODES.includes(glyph.unicode) },
  { name: 'Basic Glyphs', filter: (glyph) => isBasicLetter(glyph.unicode) },
  { name: 'Numerals', filter: (glyph) => isNumeral(glyph.unicode) },
  {
    name: 'Punctuation & Others',
    filter: (glyph) => {
      const unicode = glyph.unicode;
      if (unicode === 0x20 || unicode === 0x0d) {
        return false;
      }
      if (SPECIAL_UNICODES.includes(unicode)) {
        return false;
      }
      if (isBasicLetter(unicode)) {
        return false;
      }
      if (isNumeral(unicode)) {
        return false;
      }
      if (isAccentedLetter(unicode)) {
        return false;
      }
      if (isSymbol(unicode)) {
        return false;
      }
      return unicode < 0xe000;
    },
  },
  { name: 'Accents', filter: (g) => isAccentedLetter(g.unicode) },
  { name: 'Symbols', filter: (g) => isSymbol(g.unicode) },
];

function getNumeralSortOrder(unicode) {
  switch (true) {
    case unicode >= 0x30 && unicode <= 0x39:
      return unicode - 0x30;
    case unicode === 0x2070:
      return 10;
    case unicode === 0xb9:
      return 11;
    case unicode === 0xb2:
      return 12;
    case unicode === 0xb3:
      return 13;
    case unicode >= 0x2074 && unicode <= 0x2079:
      return 14 + (unicode - 0x2074);
    case unicode >= 0x2080 && unicode <= 0x2089:
      return 20 + (unicode - 0x2080);
    case unicode === 0xbc:
      return 30;
    case unicode === 0xbd:
      return 31;
    case unicode === 0xbe:
      return 32;
    case unicode >= 0x2150 && unicode <= 0x218f:
      return 33 + (unicode - 0x2150);
    default:
      return 100 + unicode;
  }
}

function buildCategories() {
  const allGlyphs = getAllGlyphs();
  if (allGlyphs.length === 0) {
    return [];
  }

  const categories = [];
  for (const category of GLYPH_CATEGORIES) {
    const glyphs = allGlyphs.filter(category.filter);
    if (glyphs.length > 0) {
      if (category.name === 'Special') {
        glyphs.sort(
          (a, b) => SPECIAL_UNICODES.indexOf(a.unicode) - SPECIAL_UNICODES.indexOf(b.unicode)
        );
      } else if (category.name === 'Numerals') {
        glyphs.sort((a, b) => getNumeralSortOrder(a.unicode) - getNumeralSortOrder(b.unicode));
      } else {
        glyphs.sort((a, b) => a.unicode - b.unicode);
      }
      categories.push({ name: category.name, glyphs });
    }
  }
  return categories;
}

export function createGlyphComputed() {
  return {
    _glyphCategories: [],

    loadGlyphCategories() {
      if (this._glyphCategories.length === 0) {
        const categories = buildCategories();
        if (categories.length > 0) {
          this._glyphCategories = categories;
        }
      }
      return this._glyphCategories;
    },

    get glyphCategories() {
      return this._glyphCategories;
    },

    get hasGlyphs() {
      return this._glyphCategories.length > 0;
    },
  };
}
