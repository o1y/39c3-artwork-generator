import { getAllGlyphs } from '../../../export/font-loader.js';

const SPECIAL_UNICODES = [0xe002, 0xe000, 0xe001, 0xe003, 0xe004];

const isAccentedLetter = (u) =>
  (u >= 0xc0 && u <= 0xff && u !== 0xd7 && u !== 0xf7) || (u >= 0x100 && u <= 0x24f);

const isSymbol = (u) =>
  (u >= 0x2190 && u <= 0x21ff) ||
  (u >= 0x20a0 && u <= 0x20cf) ||
  u === 0xa2 ||
  u === 0xa3 ||
  u === 0xa4 ||
  u === 0xa5 ||
  u === 0x24;

const isNumeral = (u) =>
  (u >= 0x30 && u <= 0x39) ||
  (u >= 0x2150 && u <= 0x218f) ||
  (u >= 0xbc && u <= 0xbe) ||
  u === 0xb9 ||
  u === 0xb2 ||
  u === 0xb3 ||
  (u >= 0x2070 && u <= 0x2079) ||
  (u >= 0x2080 && u <= 0x2089);

const isBasicLetter = (u) => (u >= 0x41 && u <= 0x5a) || (u >= 0x61 && u <= 0x7a);

const GLYPH_CATEGORIES = [
  { name: 'Special', filter: (g) => SPECIAL_UNICODES.includes(g.unicode) },
  { name: 'Basic Glyphs', filter: (g) => isBasicLetter(g.unicode) },
  { name: 'Numerals', filter: (g) => isNumeral(g.unicode) },
  {
    name: 'Punctuation & Others',
    filter: (g) => {
      const u = g.unicode;
      if (u === 0x20 || u === 0x0d) return false;
      if (SPECIAL_UNICODES.includes(u)) return false;
      if (isBasicLetter(u)) return false;
      if (isNumeral(u)) return false;
      if (isAccentedLetter(u)) return false;
      if (isSymbol(u)) return false;
      return u < 0xe000;
    },
  },
  { name: 'Accents', filter: (g) => isAccentedLetter(g.unicode) },
  { name: 'Symbols', filter: (g) => isSymbol(g.unicode) },
];

function getNumeralSortOrder(unicode) {
  if (unicode >= 0x30 && unicode <= 0x39) return unicode - 0x30;
  if (unicode === 0x2070) return 10;
  if (unicode === 0xb9) return 11;
  if (unicode === 0xb2) return 12;
  if (unicode === 0xb3) return 13;
  if (unicode >= 0x2074 && unicode <= 0x2079) return 14 + (unicode - 0x2074);
  if (unicode >= 0x2080 && unicode <= 0x2089) return 20 + (unicode - 0x2080);
  if (unicode === 0xbc) return 30;
  if (unicode === 0xbd) return 31;
  if (unicode === 0xbe) return 32;
  if (unicode >= 0x2150 && unicode <= 0x218f) return 33 + (unicode - 0x2150);
  return 100 + unicode;
}

function buildCategories() {
  const allGlyphs = getAllGlyphs();
  if (allGlyphs.length === 0) return [];

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
