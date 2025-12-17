// Type declarations for external dependencies without their own types

// Vite asset imports
declare module '*.woff?url' {
  const url: string;
  export default url;
}

declare module '*.woff2?url' {
  const url: string;
  export default url;
}

// opentype.js
declare module 'opentype.js' {
  export function parse(buffer: ArrayBuffer): Font;

  export interface Font {
    glyphs: GlyphSet;
    unitsPerEm: number;
    ascender: number;
    descender: number;
    getPath(text: string, x: number, y: number, fontSize: number, options?: object): Path;
    charToGlyph(char: string): Glyph;
    stringToGlyphs(text: string): Glyph[];
    getAdvanceWidth(text: string, fontSize: number, options?: object): number;
  }

  export interface GlyphSet {
    length: number;
    get(index: number): Glyph;
  }

  export interface Glyph {
    name: string;
    unicode: number;
    advanceWidth: number;
    path: Path;
    getPath(x: number, y: number, fontSize: number, options?: object): Path;
  }

  export interface Path {
    toPathData(decimalPlaces?: number): string;
    commands: PathCommand[];
  }

  export interface PathCommand {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }
}

// gif.js
declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
    transparent?: string | null;
    background?: string;
    repeat?: number;
  }

  interface FrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(image: CanvasImageSource | CanvasRenderingContext2D, options?: FrameOptions): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    render(): void;
  }

  export default GIF;
}

// Alpine.js global
interface Window {
  Alpine: typeof import('alpinejs').default;
}

// Alpine.js internal properties on elements
interface Element {
  _x_dataStack?: object[];
}
