import type { ACCIDENTALS, NOTE_CLASSES, OCTAVES } from '@/utils/MusicConstants';

// Core music note types (derived from constants for future enum usage)
export type NoteClass = typeof NOTE_CLASSES[number]; // 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = typeof ACCIDENTALS[number]; // 'natural' | 'sharp' | 'flat'
export type Octave = typeof OCTAVES[number]; // 1 | 2 | 3 | 4 | 5 | 6

// Legacy string-based note types (for backward compatibility during migration)
export type NoteName = 'c' | 'c#' | 'd' | 'd#' | 'e' | 'f' | 'f#' | 'g' | 'g#' | 'a' | 'a#' | 'b';
export type NoteNameUpper = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type LegacyNote = `${NoteName}/${Octave}` | `${NoteNameUpper}${Octave}`;

// Current object-based note type (using constants)
export type Note = {
  noteClass: NoteClass;
  octave: Octave;
  accidental: Accidental;
};

// Staff position representation
export type StaffPosition = {
  note: Note;
  linePosition: number; // 0-10 (lines and spaces from bottom)
  requiresLedgerLine: boolean;
  accidental?: 'sharp' | 'flat';
  contextMenu?: {
    x: number;
    y: number;
  };
};

// Game state management
export type GamePhase = 'setup' | 'listening' | 'answering' | 'feedback';

export type GameState = {
  currentNotes: Note[];
  selectedNotes: Note[];
  gamePhase: GamePhase;
  score: number;
  totalAttempts: number;
  difficulty: number;
  limitNotes: boolean;
};

// User settings and preferences
export type GameSettings = {
  minNotes: number; // 1-8 notes
  maxNotes: number; // 1-8 notes
  volume: number; // 0-1
  autoReplay: boolean;
};

// Statistics tracking
export type SessionResult = {
  timestamp: Date;
  difficulty: number;
  correct: boolean;
  notesPlayed: Note[];
  userAnswer: Note[];
};

export type UserStatistics = {
  totalAttempts: number;
  correctAnswers: number;
  accuracyByDifficulty: Record<number, number>;
  sessionHistory: SessionResult[];
};

// Audio engine types
export type AudioEngine = {
  playNotes: (frequencies: number[]) => Promise<void>;
  stopNotes: () => void;
  isSupported: () => boolean;
  setVolume: (volume: number) => void;
};

// Component prop types
export type DigitalStaffProps = {
  selectedNotes: Note[];
  onNoteSelect: (note: Note) => void;
  onNoteDeselect: (note: Note) => void;
  maxNotes: number;
  showCorrectAnswer?: boolean;
  correctNotes?: Note[];
  validationResult?: import('@/utils/AnswerValidation').ValidationResult;
};

export type GameControllerProps = {
  initialSettings?: Partial<GameSettings>;
};

// to avoid linting errors
export const EMPTY_OBJECT: object = {};
