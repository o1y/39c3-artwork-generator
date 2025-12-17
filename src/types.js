// Shared type definitions for the 39C3 Power Cycles artwork generator.
// Usage: Import types with @typedef {import('./types.js').YourType} YourType

// =============================================================================
// Animation Types
// =============================================================================

/**
 * Available animation modes
 * @typedef {'wave' | 'pulse' | 'rotate' | 'breathe' | 'bounce' | 'spotlight'} AnimationMode
 */

/**
 * Toggle glyph variant styles
 * @typedef {'left-filled' | 'left-outlined' | 'right-filled' | 'right-outlined'} ToggleVariant
 */

// =============================================================================
// Renderer Types
// =============================================================================

/**
 * Text baseline alignment options
 * @typedef {'top' | 'middle' | 'bottom'} TextBaseline
 */

/**
 * Options for drawing text and glyphs
 * @typedef {Object} DrawOptions
 * @property {TextBaseline} [baseline='bottom'] - Text baseline alignment
 * @property {number} [width] - Fixed glyph width for toggle glyphs
 */

/**
 * Offscreen canvas data returned by CanvasRenderer.createOffscreen()
 * @typedef {Object} OffscreenCanvasData
 * @property {import('./rendering/core/canvas-renderer.js').CanvasRenderer} renderer - Renderer for the offscreen canvas
 * @property {HTMLCanvasElement} canvas - The offscreen canvas element
 */

/**
 * Offscreen SVG group data returned by SVGRenderer.createOffscreen()
 * @typedef {Object} OffscreenSVGData
 * @property {import('./rendering/core/svg-renderer.js').SVGRenderer} renderer - Renderer for the offscreen group
 * @property {SVGGElement} group - The SVG group element
 */

/**
 * SVG transform state
 * @typedef {Object} SVGTransform
 * @property {number} translateX - X translation offset
 * @property {number} translateY - Y translation offset
 * @property {number} scaleX - X scale factor
 * @property {number} scaleY - Y scale factor
 */

// =============================================================================
// Settings & Configuration Types
// =============================================================================

/**
 * Font axis configuration with min/max ranges
 * @typedef {Object} FontAxes
 * @property {[number, number]} weight - Weight axis range [min, max]
 * @property {[number, number]} width - Width axis range [min, max]
 * @property {[number, number]} opticalSize - Optical size axis range [min, max]
 */

/**
 * Theme capability flags
 * @typedef {Object} Capabilities
 * @property {boolean} animated - Whether theme supports animation
 * @property {boolean} variableWeight - Whether theme supports variable font weight
 */

/**
 * Theme control visibility settings
 * @typedef {Object} ThemeControls
 * @property {boolean} [showLines] - Show line count control
 * @property {boolean} [showWidth] - Show width axis control
 * @property {boolean} [showOpsz] - Show optical size control
 * @property {boolean} [showMode] - Show animation mode control
 * @property {boolean} [showToggleVariant] - Show toggle variant control
 * @property {boolean} [showSmoothColorModes] - Show smooth color options
 * @property {boolean} [showMinWeight] - Show min weight control
 * @property {boolean} [showMaxWeight] - Show max weight control
 * @property {boolean} [showMultilineInput] - Show multiline text input
 * @property {boolean} [showTextInput] - Show text input
 * @property {boolean} [showPlayControls] - Show play controls
 * @property {boolean} [showExport] - Show export options
 * @property {boolean} [showColorMode] - Show color mode selector
 * @property {boolean} [showAnimationSpeed] - Show animation speed control
 * @property {boolean} [showStaticWeight] - Show static weight control
 */

/**
 * Theme preset configuration
 * @typedef {Object} ThemePreset
 * @property {ThemeRenderer} renderer - Theme render function
 * @property {string} colorMode - Default color mode for this theme
 * @property {string} text - Default text to display
 * @property {number} [numLines] - Default number of lines (for line-based themes)
 * @property {'single-row' | 'two-row'} [layout] - Layout mode (for toggle themes)
 * @property {boolean} [forceUppercase] - Whether to force uppercase text
 * @property {Capabilities} capabilities - What this theme supports
 * @property {ThemeControls} controls - Which UI controls to show
 */

/**
 * Theme renderer function signature
 * @callback ThemeRenderer
 * @param {import('./rendering/core/renderer-interface.js').Renderer} renderer - Rendering engine
 * @param {number} canvasSize - Canvas dimension (square)
 * @returns {void}
 */

/**
 * Global settings object
 * @typedef {Object} Settings
 * @property {string} text - The text to display
 * @property {number} numLines - Number of animation lines (1-100)
 * @property {number} minWeight - Minimum font weight (10-100)
 * @property {number} maxWeight - Maximum font weight (10-100)
 * @property {number} staticWeight - Static font weight for non-animated themes
 * @property {number} widthValue - Font width axis value (50-160)
 * @property {number} opszValue - Optical size axis value (8-140)
 * @property {number} lineSpacingFactor - Line spacing multiplier
 * @property {number} canvasSize - Canvas dimensions in pixels
 * @property {number} margin - Canvas margin in pixels
 * @property {number} time - Current animation time in seconds
 * @property {number} animationSpeed - Animation speed multiplier (0.1-10)
 * @property {AnimationMode} mode - Animation mode
 * @property {string} theme - Active theme name
 * @property {ToggleVariant} toggleVariant - Toggle glyph style
 * @property {string} colorMode - Active color mode
 * @property {number} animationOriginX - Spotlight animation origin X (0-1)
 * @property {number} animationOriginY - Spotlight animation origin Y (0-1)
 * @property {number} animationPhaseOffset - Animation phase offset for spotlight
 * @property {Capabilities} [capabilities] - Theme capabilities (added at runtime)
 */

// =============================================================================
// Export Types
// =============================================================================

/**
 * Export progress callbacks
 * @typedef {Object} ExportCallbacks
 * @property {() => void} [onStart] - Called when export begins
 * @property {(progress: number) => void} [onProgress] - Called with progress 0-100
 * @property {() => void} [onComplete] - Called when export finishes
 */

/**
 * Settings snapshot for export state management
 * @typedef {Object} SettingsSnapshot
 * @property {number} canvasSize - Original canvas size
 * @property {number} margin - Original margin
 * @property {number} time - Original time
 * @property {number} animationSpeed - Original animation speed
 */

/**
 * Temporary canvas data for export
 * @typedef {Object} TempCanvasData
 * @property {HTMLCanvasElement} canvas - Created canvas element
 * @property {CanvasRenderingContext2D} context - 2D rendering context
 * @property {number} scaledSize - Actual canvas dimensions
 */

// =============================================================================
// Font & Glyph Types
// =============================================================================

/**
 * Glyph object from opentype.js
 * @typedef {Object} Glyph
 * @property {string} name - Glyph name
 * @property {number} unicode - Unicode code point
 * @property {number} advanceWidth - Glyph advance width
 * @property {Object} [path] - Glyph path data
 */

/**
 * Result from text/glyph to path conversion
 * @typedef {Object} PathResult
 * @property {string} pathData - SVG path data string
 * @property {number} width - Width of the rendered text/glyph
 */

// Export empty object to make this a module (required for JSDoc imports)
export {};
