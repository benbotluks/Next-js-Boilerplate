import type { AudioMode } from '@/config/gameConfig';
import type { ACCIDENTALS, NOTE_CLASSES, OCTAVES } from '@/utils/MusicConstants';
import { nanoid } from 'nanoid';

export type NoteClass = typeof NOTE_CLASSES[number];
export type Accidental = typeof ACCIDENTALS[number];
export type Octave = typeof OCTAVES[number];

// Note class for object-based operations
export class Note {
  public readonly id: string;

  constructor(
    public readonly noteClass: NoteClass,
    public readonly octave: Octave,
    public readonly accidental: Accidental = 'natural',
  ) {
    this.id = nanoid();
  }

  // Computed properties
  get displayFormat(): string {
    const accidentalSymbol = this.accidental === 'natural'
      ? ''
      : this.accidental === 'sharp'
        ? '#'
        : 'b';
    return `${this.noteClass}${accidentalSymbol}${this.octave}`;
  }

  get vexFlowFormat(): string {
    return this.displayFormat;
  }

  // Immutable update methods
  withOctave(newOctave: Octave): Note {
    return new Note(this.noteClass, newOctave, this.accidental);
  }

  withAccidental(newAccidental: Accidental): Note {
    return new Note(this.noteClass, this.octave, newAccidental);
  }

  withNoteClass(newNoteClass: NoteClass): Note {
    return new Note(newNoteClass, this.octave, this.accidental);
  }

  // Utility methods
  equals(other: Note): boolean {
    return this.id === other.id;
  }

  samePitch(other: Note): boolean {
    return this.noteClass === other.noteClass
      && this.octave === other.octave
      && this.accidental === other.accidental;
  }

  // For backward compatibility during migration
  toString(): string {
    return this.displayFormat;
  }

  // Static factory methods
  static fromString(noteString: string): Note {
    // Parse "C4", "F#5", "Bb3" etc.
    const match = noteString.match(/^([A-G])([#b]?)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid note format: ${noteString}`);
    }

    const noteClass = match[1] as NoteClass;
    const octave = Number.parseInt(match[3]!) as Octave;
    let accidental: Accidental = 'natural';

    if (match[2] === '#') {
      accidental = 'sharp';
    } else if (match[2] === 'b') {
      accidental = 'flat';
    }

    return new Note(noteClass, octave, accidental);
  }
}

// Current object-based note type (using constants) - keeping for backward compatibility
export type NoteObject = {
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

export type GameControllerProps = {
  initialSettings?: Partial<GameSettings>;
};

// to avoid linting errors
export const EMPTY_OBJECT: object = {};
