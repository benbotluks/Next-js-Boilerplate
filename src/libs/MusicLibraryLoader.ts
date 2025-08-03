/**
 * Music Library Loader
 * Handles dynamic imports and initialization of music libraries
 * Provides tree-shaking and bundle optimization
 */

import { TONE_CONFIG, VEXFLOW_CONFIG, TONAL_CONFIG, FEATURE_DETECTION } from './MusicLibraryConfig';

// Type definitions for library imports
export type ToneModule = typeof import('tone');
export type VexFlowModule = typeof import('vexflow');
export type TonalNoteModule = typeof import('@tonaljs/note');
export type TonalMidiModule = typeof import('@tonaljs/midi');

// Lazy loading cache
const libraryCache = new Map<string, any>();

/**
 * Dynamically import Tone.js with optimization
 */
export async function loadToneJS(): Promise<ToneModule> {
  if (libraryCache.has('tone')) {
    return libraryCache.get('tone');
  }

  try {
    // Check Web Audio API support
    if (!FEATURE_DETECTION.hasWebAudio()) {
      throw new Error('Web Audio API not supported');
    }

    // Dynamic import for better code splitting
    const Tone = await import('tone');

    // Initialize with optimized settings
    if (typeof window !== 'undefined') {
      // Set audio context configuration
      Tone.getContext().latencyHint = TONE_CONFIG.context.latencyHint;
      Tone.getContext().lookAhead = TONE_CONFIG.context.lookAhead;
    }

    libraryCache.set('tone', Tone);
    return Tone;
  } catch (error) {
    console.error('Failed to load Tone.js:', error);
    throw error;
  }
}

/**
 * Dynamically import VexFlow with optimization
 */
export async function loadVexFlow(): Promise<VexFlowModule> {
  if (libraryCache.has('vexflow')) {
    return libraryCache.get('vexflow');
  }

  try {
    // Check SVG support
    if (!FEATURE_DETECTION.hasSVG() && !FEATURE_DETECTION.hasCanvas()) {
      throw new Error('Neither SVG nor Canvas support detected');
    }

    // Dynamic import for better code splitting
    const VexFlow = await import('vexflow');

    libraryCache.set('vexflow', VexFlow);
    return VexFlow;
  } catch (error) {
    console.error('Failed to load VexFlow:', error);
    throw error;
  }
}

/**
 * Dynamically import Tonal modules with tree-shaking
 */
export async function loadTonalNote(): Promise<TonalNoteModule> {
  if (libraryCache.has('tonal-note')) {
    return libraryCache.get('tonal-note');
  }

  try {
    // Import only the Note module for better tree-shaking
    const TonalNote = await import('@tonaljs/note');

    libraryCache.set('tonal-note', TonalNote);
    return TonalNote;
  } catch (error) {
    console.error('Failed to load Tonal Note:', error);
    throw error;
  }
}

/**
 * Dynamically import Tonal MIDI module
 */
export async function loadTonalMidi(): Promise<TonalMidiModule> {
  if (libraryCache.has('tonal-midi')) {
    return libraryCache.get('tonal-midi');
  }

  try {
    const TonalMidi = await import('@tonaljs/midi');

    libraryCache.set('tonal-midi', TonalMidi);
    return TonalMidi;
  } catch (error) {
    console.error('Failed to load Tonal MIDI:', error);
    throw error;
  }
}

/**
 * Preload all music libraries for better performance
 */
export async function preloadMusicLibraries(): Promise<void> {
  try {
    // Preload in parallel for better performance
    await Promise.all([
      loadToneJS().catch(() => console.warn('Tone.js preload failed')),
      loadVexFlow().catch(() => console.warn('VexFlow preload failed')),
      loadTonalNote().catch(() => console.warn('Tonal Note preload failed')),
      loadTonalMidi().catch(() => console.warn('Tonal MIDI preload failed')),
    ]);

    console.log('Music libraries preloaded successfully');
  } catch (error) {
    console.warn('Music library preloading failed:', error);
  }
}

/**
 * Check if all required libraries are available
 */
export function checkLibraryCompatibility(): {
  tone: boolean;
  vexflow: boolean;
  tonal: boolean;
  overall: boolean;
} {
  const compatibility = {
    tone: FEATURE_DETECTION.hasWebAudio(),
    vexflow: FEATURE_DETECTION.hasSVG() || FEATURE_DETECTION.hasCanvas(),
    tonal: true, // Tonal is pure JavaScript, always compatible
    overall: false,
  };

  compatibility.overall = compatibility.tone && compatibility.vexflow && compatibility.tonal;

  return compatibility;
}

/**
 * Get library versions for debugging
 */
export async function getLibraryVersions(): Promise<{
  tone?: string;
  vexflow?: string;
  tonal?: string;
}> {
  const versions: { tone?: string; vexflow?: string; tonal?: string } = {};

  try {
    const Tone = await loadToneJS();
    versions.tone = (Tone as any).version || 'unknown';
  } catch {
    // Ignore errors
  }

  try {
    const VexFlow = await loadVexFlow();
    versions.vexflow = (VexFlow as any).BUILD?.VERSION || 'unknown';
  } catch {
    // Ignore errors
  }

  try {
    const TonalNote = await loadTonalNote();
    versions.tonal = (TonalNote as any).version || 'unknown';
  } catch {
    // Ignore errors
  }

  return versions;
}

/**
 * Clear library cache (useful for testing)
 */
export function clearLibraryCache(): void {
  libraryCache.clear();
}