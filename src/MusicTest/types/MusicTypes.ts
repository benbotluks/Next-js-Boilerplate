import type { Stave } from 'vexflow';
import type { AudioMode } from '@/config/gameConfig';
import type { Note } from '@/libs/Note';
import type { ACCIDENTALS, NOTE_CLASSES, OCTAVES } from '@/utils/MusicConstants';

export type NoteClass = typeof NOTE_CLASSES[number];
export type Accidental = typeof ACCIDENTALS[number];
export type Octave = typeof OCTAVES[number];

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
  audioMode: AudioMode;
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

export type Clef = 'bass' | 'treble';

export type GameControllerProps = {
  initialSettings?: Partial<GameSettings>;
};

export type Staves = {
  treble: Stave;
  bass: Stave;
};

// to avoid linting errors
export const EMPTY_OBJECT: object = {};
