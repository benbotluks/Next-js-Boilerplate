/**
 * Configuration for music libraries (Tone.js, VexFlow, Tonal)
 * Handles initialization, optimization, and compatibility settings
 */

// Tone.js configuration
export const TONE_CONFIG = {
  // Audio context settings
  context: {
    latencyHint: 'interactive' as const,
    lookAhead: 0.1,
  },

  // Performance optimizations
  performance: {
    // Enable Web Audio API optimizations
    enableAudioWorklet: true,
    // Buffer size for better performance
    bufferSize: 256,
  },
} as const;

// VexFlow configuration
export const VEXFLOW_CONFIG = {
  // Default renderer settings
  renderer: {
    backend: 'svg' as const,
    width: 800,
    height: 200,
  },

  // Font loading configuration
  fonts: {
    // Use Bravura font for better notation rendering
    defaultFont: 'Bravura',
    // Enable font loading optimization
    preloadFonts: true,
  },

  // Staff configuration
  staff: {
    clef: 'treble' as const,
    timeSignature: '4/4' as const,
    keySignature: 'C' as const,
  },
} as const;

// Tonal configuration
export const TONAL_CONFIG = {
  // Note processing settings
  notes: {
    // Default octave for note processing
    defaultOctave: 4,
    // Enable enharmonic equivalents
    enharmonics: true,
  },

  // Frequency calculation settings
  frequency: {
    // A4 tuning frequency (Hz)
    a4Frequency: 440,
    // Enable microtonal support
    microtonal: false,
  },
} as const;

// Bundle optimization settings
export const BUNDLE_CONFIG = {
  // Tone.js tree-shaking configuration
  tone: {
    // Only import needed modules
    modules: [
      'Synth',
      'Frequency',
      'Transport',
      'Master',
      'Context',
    ],
  },

  // VexFlow optimization
  vexflow: {
    // Use core build for smaller bundle
    useCore: false,
    // Enable font subsetting
    fontSubsetting: true,
  },

  // Tonal modular imports
  tonal: {
    // Only import needed packages
    packages: [
      '@tonaljs/note',
      '@tonaljs/midi',
      '@tonaljs/frequency',
      '@tonaljs/interval',
    ],
  },
} as const;

// Runtime feature detection
export const FEATURE_DETECTION = {
  // Check Web Audio API support
  hasWebAudio: () => {
    return typeof window !== 'undefined' &&
      (window.AudioContext || (window as any).webkitAudioContext);
  },

  // Check SVG support for VexFlow
  hasSVG: () => {
    return typeof document !== 'undefined' &&
      document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
  },

  // Check Canvas support as fallback
  hasCanvas: () => {
    return typeof document !== 'undefined' &&
      document.createElement('canvas').getContext;
  },
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
  // Audio initialization errors
  audio: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackToSilent: true,
  },

  // Notation rendering errors
  notation: {
    fallbackToText: true,
    showErrorBoundary: true,
  },

  // Music theory calculation errors
  theory: {
    useDefaultValues: true,
    logErrors: process.env.NODE_ENV === 'development',
  },
} as const;

// Development helpers
export const DEV_CONFIG = {
  // Enable debug logging in development
  enableDebugLogging: process.env.NODE_ENV === 'development',

  // Performance monitoring
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development',

  // Bundle analysis
  enableBundleAnalysis: process.env.ANALYZE === 'true',
} as const;