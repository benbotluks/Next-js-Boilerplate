import type { Note, StaffPosition } from '@/types/MusicTypes';
import { Interval, Note as TonalNote } from 'tonal';

/**
 * Modern music theory utilities using Tonal library
 * Replaces hardcoded constants with library-generated values
 */

// Generate NOTE_FREQUENCIES mapping using Tonal
export const NOTE_FREQUENCIES: Record<Note, number> = (() => {
  const frequencies: Partial<Record<Note, number>> = {};

  // Define the notes we support
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
  const octaves = [3, 4, 5, 6] as const;

  for (const octave of octaves) {
    for (const noteName of noteNames) {
      const noteString = `${noteName}${octave}` as Note;
      const frequency = TonalNote.freq(`${noteName}${octave}`);
      if (frequency) {
        frequencies[noteString] = Math.round(frequency * 100) / 100; // Round to 2 decimal places
      }
    }
  }

  return frequencies as Record<Note, number>;
})();

// Staff position mappings for treble clef (maintained for backward compatibility)
// Position 0 = bottom line (E4), Position 10 = top line (F5)
export const STAFF_POSITIONS: Record<Note, StaffPosition> = {
  // Below staff (ledger lines)
  'C4': { note: 'C4', linePosition: -2, requiresLedgerLine: true },
  'C#4': { note: 'C#4', linePosition: -2, requiresLedgerLine: true, accidental: 'sharp' },
  'D4': { note: 'D4', linePosition: -1, requiresLedgerLine: true },
  'D#4': { note: 'D#4', linePosition: -1, requiresLedgerLine: true, accidental: 'sharp' },

  // On staff
  'E4': { note: 'E4', linePosition: 0, requiresLedgerLine: false }, // Bottom line
  'F4': { note: 'F4', linePosition: 1, requiresLedgerLine: false }, // First space
  'F#4': { note: 'F#4', linePosition: 1, requiresLedgerLine: false, accidental: 'sharp' },
  'G4': { note: 'G4', linePosition: 2, requiresLedgerLine: false }, // Second line
  'G#4': { note: 'G#4', linePosition: 2, requiresLedgerLine: false, accidental: 'sharp' },
  'A4': { note: 'A4', linePosition: 3, requiresLedgerLine: false }, // Second space
  'A#4': { note: 'A#4', linePosition: 3, requiresLedgerLine: false, accidental: 'sharp' },
  'B4': { note: 'B4', linePosition: 4, requiresLedgerLine: false }, // Third line
  'C5': { note: 'C5', linePosition: 5, requiresLedgerLine: false }, // Third space
  'C#5': { note: 'C#5', linePosition: 5, requiresLedgerLine: false, accidental: 'sharp' },
  'D5': { note: 'D5', linePosition: 6, requiresLedgerLine: false }, // Fourth line
  'D#5': { note: 'D#5', linePosition: 6, requiresLedgerLine: false, accidental: 'sharp' },
  'E5': { note: 'E5', linePosition: 7, requiresLedgerLine: false }, // Fourth space
  'F5': { note: 'F5', linePosition: 8, requiresLedgerLine: false }, // Top line
  'F#5': { note: 'F#5', linePosition: 8, requiresLedgerLine: false, accidental: 'sharp' },

  // Above staff (ledger lines)
  'G5': { note: 'G5', linePosition: 9, requiresLedgerLine: true }, // First space above
  'G#5': { note: 'G#5', linePosition: 9, requiresLedgerLine: true, accidental: 'sharp' },
  'A5': { note: 'A5', linePosition: 10, requiresLedgerLine: true }, // First ledger line above
  'A#5': { note: 'A#5', linePosition: 10, requiresLedgerLine: true, accidental: 'sharp' },
  'B5': { note: 'B5', linePosition: 11, requiresLedgerLine: true },
  'C6': { note: 'C6', linePosition: 12, requiresLedgerLine: true },
  'C#6': { note: 'C#6', linePosition: 12, requiresLedgerLine: true, accidental: 'sharp' },
  'D6': { note: 'D6', linePosition: 13, requiresLedgerLine: true },
  'D#6': { note: 'D#6', linePosition: 13, requiresLedgerLine: true, accidental: 'sharp' },
  'E6': { note: 'E6', linePosition: 14, requiresLedgerLine: true },
  'F6': { note: 'F6', linePosition: 15, requiresLedgerLine: true },
  'F#6': { note: 'F#6', linePosition: 15, requiresLedgerLine: true, accidental: 'sharp' },
  'G6': { note: 'G6', linePosition: 16, requiresLedgerLine: true },
  'G#6': { note: 'G#6', linePosition: 16, requiresLedgerLine: true, accidental: 'sharp' },
  'A6': { note: 'A6', linePosition: 17, requiresLedgerLine: true },
  'A#6': { note: 'A#6', linePosition: 17, requiresLedgerLine: true, accidental: 'sharp' },
  'B6': { note: 'B6', linePosition: 18, requiresLedgerLine: true },

  // Lower octave notes
  'C3': { note: 'C3', linePosition: -8, requiresLedgerLine: true },
  'C#3': { note: 'C#3', linePosition: -8, requiresLedgerLine: true, accidental: 'sharp' },
  'D3': { note: 'D3', linePosition: -7, requiresLedgerLine: true },
  'D#3': { note: 'D#3', linePosition: -7, requiresLedgerLine: true, accidental: 'sharp' },
  'E3': { note: 'E3', linePosition: -6, requiresLedgerLine: true },
  'F3': { note: 'F3', linePosition: -5, requiresLedgerLine: true },
  'F#3': { note: 'F#3', linePosition: -5, requiresLedgerLine: true, accidental: 'sharp' },
  'G3': { note: 'G3', linePosition: -4, requiresLedgerLine: true },
  'G#3': { note: 'G#3', linePosition: -4, requiresLedgerLine: true, accidental: 'sharp' },
  'A3': { note: 'A3', linePosition: -3, requiresLedgerLine: true },
  'A#3': { note: 'A#3', linePosition: -3, requiresLedgerLine: true, accidental: 'sharp' },
  'B3': { note: 'B3', linePosition: -2, requiresLedgerLine: true },
};

// Available notes for the game (reasonable range for ear training)
export const AVAILABLE_NOTES: Note[] = [
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'A4',
  'B4',
  'C5',
  'D5',
  'E5',
  'F5',
  'G5',
  'A5',
  'B5',
];

/**
 * Helper function to normalize notes to sharp notation
 */
function normalizeToSharp(note: string): string {
  const tonalNote = TonalNote.get(note);

  // Handle enharmonic equivalents and edge cases
  const normalizeMap: Record<string, string> = {
    // Flats to sharps
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
    // Edge cases like B# = C, E# = F, Cb = B, Fb = E
    'B#': 'C',
    'E#': 'F',
    'Cb': 'B',
    'Fb': 'E',
  };

  const normalizedPc = normalizeMap[tonalNote.pc] || tonalNote.pc;
  let octave = tonalNote.oct;

  // Handle octave adjustments for edge cases
  if (tonalNote.pc === 'B#') {
    octave = (octave || 4) + 1; // B#3 becomes C4
  } else if (tonalNote.pc === 'Cb') {
    octave = (octave || 4) - 1; // Cb4 becomes B3
  }

  return `${normalizedPc}${octave}`;
}

/**
 * Music theory utility functions using Tonal
 */
export const MusicTheoryUtils = {
  /**
   * Get frequency for a note using Tonal
   */
  getNoteFrequency(note: Note): number {
    const frequency = TonalNote.freq(note);
    if (!frequency) {
      throw new Error(`Invalid note: ${note}`);
    }
    return Math.round(frequency * 100) / 100;
  },

  /**
   * Validate if a string is a valid note
   */
  isValidNote(note: string): note is Note {
    const tonalNote = TonalNote.get(note);
    if (!tonalNote.name || !tonalNote.oct) {
      return false;
    }

    // Check if it's within our supported range
    const octave = tonalNote.oct;
    const noteName = tonalNote.pc;

    // Accept both sharp and flat notation, but convert to our supported format
    const supportedNotes = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

    return octave >= 3 && octave <= 6 && supportedNotes.includes(noteName);
  },

  /**
   * Transpose a note by a number of semitones
   */
  transposeNote(note: Note, semitones: number): Note {
    const interval = Interval.fromSemitones(semitones);
    const transposed = TonalNote.transpose(note, interval);
    const normalized = normalizeToSharp(transposed);

    if (!this.isValidNote(normalized)) {
      throw new Error(`Transposed note ${normalized} is out of supported range`);
    }
    return normalized as Note;
  },

  /**
   * Generate a random set of notes
   */
  getRandomNoteSet(count: number, range: Note[] = AVAILABLE_NOTES): Note[] {
    if (count > range.length) {
      throw new Error(`Cannot generate ${count} unique notes from a range of ${range.length} notes`);
    }

    const shuffled = [...range].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * Get all notes in a specific octave
   */
  getNotesInOctave(octave: 3 | 4 | 5 | 6): Note[] {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
    return noteNames.map(name => `${name}${octave}` as Note);
  },

  /**
   * Get the octave of a note
   */
  getNoteOctave(note: Note): number {
    const tonalNote = TonalNote.get(note);
    return tonalNote.oct || 4;
  },

  /**
   * Get the note name without octave
   */
  getNoteName(note: Note): string {
    const tonalNote = TonalNote.get(note);
    return tonalNote.pc || '';
  },

  /**
   * Check if a note has an accidental (sharp/flat)
   */
  hasAccidental(note: Note): boolean {
    const noteName = this.getNoteName(note);
    return noteName.includes('#') || noteName.includes('b');
  },

  /**
   * Get the enharmonic equivalent of a note (if applicable)
   */
  getEnharmonic(note: Note): Note | null {
    const tonalNote = TonalNote.get(note);
    const enharmonic = TonalNote.enharmonic(tonalNote.name);

    if (enharmonic && enharmonic !== tonalNote.name) {
      const enharmonicWithOctave = `${enharmonic}${tonalNote.oct}`;
      return this.isValidNote(enharmonicWithOctave) ? enharmonicWithOctave as Note : null;
    }

    return null;
  },
};

// Default game settings (maintained for backward compatibility)
export const DEFAULT_SETTINGS = {
  noteCount: 3,
  volume: 0.7,
  autoReplay: false,
} as const;
