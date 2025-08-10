import type { Note } from '@/types/MusicTypes';

// Note frequency mappings in Hz

// Available notes for the game (reasonable range for ear training)
export const AVAILABLE_NOTES: Note[] = [
  'B3',
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
