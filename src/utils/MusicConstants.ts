import type { Note, StaffPosition } from '@/types/MusicTypes';

// Note frequency mappings in Hz

// Staff position mappings for treble clef
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

// Default game settings
export const DEFAULT_SETTINGS = {
  noteCount: 3,
  volume: 0.7,
  autoReplay: false,
} as const;
