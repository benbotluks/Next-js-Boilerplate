// Core music note types
export type NoteName = 'c' | 'c#' | 'd' | 'd#' | 'e' | 'f' | 'f#' | 'g' | 'g#' | 'a' | 'a#' | 'b';
export type Octave = 1 | 2 | 3 | 4 | 5 | 6;
export type Note = `${NoteName}/${Octave}`;

// Staff position representation
export type StaffPosition = {
  note: Note;
  linePosition: number; // 0-10 (lines and spaces from bottom)
  requiresLedgerLine: boolean;
  accidental?: 'sharp' | 'flat';
};

// Game state management
export type GamePhase = 'setup' | 'listening' | 'answering' | 'feedback';

export type GameState = {
  currentNotes: Note[];
  selectedNotes: Note[];
  gamePhase: GamePhase;
  score: number;
  totalAttempts: number;
  difficulty: number; // 2-6 notes
};

// User settings and preferences
export type GameSettings = {
  noteCount: number; // 2-6 notes
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
