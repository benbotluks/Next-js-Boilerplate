import type { GameSettings, Note, NoteName, Octave, UserStatistics } from '@/types/MusicTypes';
import { AVAILABLE_NOTES, NOTE_FREQUENCIES } from './MusicConstants';

// Note validation functions
export function isValidNote(note: string): note is Note {
  return note in NOTE_FREQUENCIES;
}

export function isValidNoteName(noteName: string): noteName is NoteName {
  const validNoteNames: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return validNoteNames.includes(noteName as NoteName);
}

export function isValidOctave(octave: number): octave is Octave {
  return [3, 4, 5, 6].includes(octave);
}

export function parseNote(noteString: string): { noteName: NoteName; octave: Octave } | null {
  if (noteString.length < 2 || noteString.length > 3) {
    return null;
  }

  let noteName: string;
  let octaveStr: string;

  if (noteString.length === 2) {
    noteName = noteString[0]!; // Non-null assertion since we've checked length
    octaveStr = noteString[1]!; // Non-null assertion since we've checked length
  } else {
    noteName = noteString.slice(0, 2);
    octaveStr = noteString[2]!; // Non-null assertion since we've checked length
  }

  const octave = Number.parseInt(octaveStr, 10);

  if (!isValidNoteName(noteName) || !isValidOctave(octave)) {
    return null;
  }

  return { noteName, octave };
}

export function isNoteInGameRange(note: Note): boolean {
  return AVAILABLE_NOTES.includes(note);
}

// Game settings validation
export function validateGameSettings(settings: Partial<GameSettings>): {
  isValid: boolean;
  errors: string[];
  validatedSettings: GameSettings;
} {
  const errors: string[] = [];
  const validatedSettings: GameSettings = {
    noteCount: 3,
    volume: 0.7,
    autoReplay: false,
  };

  // Validate note count
  if (settings.noteCount !== undefined) {
    if (!Number.isInteger(settings.noteCount) || settings.noteCount < 2 || settings.noteCount > 6) {
      errors.push('Note count must be an integer between 2 and 6');
    } else {
      validatedSettings.noteCount = settings.noteCount;
    }
  }

  // Validate volume
  if (settings.volume !== undefined) {
    if (typeof settings.volume !== 'number' || settings.volume < 0 || settings.volume > 1) {
      errors.push('Volume must be a number between 0 and 1');
    } else {
      validatedSettings.volume = settings.volume;
    }
  }

  // Validate autoReplay
  if (settings.autoReplay !== undefined) {
    if (typeof settings.autoReplay !== 'boolean') {
      errors.push('AutoReplay must be a boolean value');
    } else {
      validatedSettings.autoReplay = settings.autoReplay;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedSettings,
  };
}

// Note array validation
export function validateNoteArray(notes: string[]): {
  isValid: boolean;
  errors: string[];
  validNotes: Note[];
} {
  const errors: string[] = [];
  const validNotes: Note[] = [];

  if (!Array.isArray(notes)) {
    return {
      isValid: false,
      errors: ['Notes must be provided as an array'],
      validNotes: [],
    };
  }

  if (notes.length === 0) {
    return {
      isValid: false,
      errors: ['At least one note must be provided'],
      validNotes: [],
    };
  }

  if (notes.length > 6) {
    errors.push('Maximum of 6 notes allowed');
  }

  for (const note of notes) {
    if (typeof note !== 'string') {
      errors.push(`Invalid note type: ${typeof note}. Notes must be strings.`);
      continue;
    }

    if (!isValidNote(note)) {
      errors.push(`Invalid note: ${note}`);
      continue;
    }

    if (!isNoteInGameRange(note)) {
      errors.push(`Note ${note} is outside the game range`);
      continue;
    }

    validNotes.push(note);
  }

  // Check for duplicates
  const uniqueNotes = [...new Set(validNotes)];
  if (uniqueNotes.length !== validNotes.length) {
    errors.push('Duplicate notes are not allowed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    validNotes: uniqueNotes,
  };
}

// Statistics validation
export function validateUserStatistics(stats: any): {
  isValid: boolean;
  errors: string[];
  validatedStats: UserStatistics;
} {
  const errors: string[] = [];
  const validatedStats: UserStatistics = {
    totalAttempts: 0,
    correctAnswers: 0,
    accuracyByDifficulty: {},
    sessionHistory: [],
  };

  if (typeof stats !== 'object' || stats === null) {
    return {
      isValid: false,
      errors: ['Statistics must be an object'],
      validatedStats,
    };
  }

  // Validate totalAttempts
  if (stats.totalAttempts !== undefined) {
    if (!Number.isInteger(stats.totalAttempts) || stats.totalAttempts < 0) {
      errors.push('Total attempts must be a non-negative integer');
    } else {
      validatedStats.totalAttempts = stats.totalAttempts;
    }
  }

  // Validate correctAnswers
  if (stats.correctAnswers !== undefined) {
    if (!Number.isInteger(stats.correctAnswers) || stats.correctAnswers < 0) {
      errors.push('Correct answers must be a non-negative integer');
    } else {
      validatedStats.correctAnswers = stats.correctAnswers;
    }
  }

  // Validate that correctAnswers <= totalAttempts
  if (validatedStats.correctAnswers > validatedStats.totalAttempts) {
    errors.push('Correct answers cannot exceed total attempts');
  }

  // Validate accuracyByDifficulty
  if (stats.accuracyByDifficulty !== undefined) {
    if (typeof stats.accuracyByDifficulty !== 'object') {
      errors.push('Accuracy by difficulty must be an object');
    } else {
      for (const [difficulty, accuracy] of Object.entries(stats.accuracyByDifficulty)) {
        const difficultyNum = Number.parseInt(difficulty, 10);
        if (!Number.isInteger(difficultyNum) || difficultyNum < 2 || difficultyNum > 6) {
          errors.push(`Invalid difficulty level: ${difficulty}`);
          continue;
        }
        if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1) {
          errors.push(`Invalid accuracy value for difficulty ${difficulty}: must be between 0 and 1`);
          continue;
        }
        validatedStats.accuracyByDifficulty[difficultyNum] = accuracy;
      }
    }
  }

  // Validate sessionHistory
  if (stats.sessionHistory !== undefined) {
    if (!Array.isArray(stats.sessionHistory)) {
      errors.push('Session history must be an array');
    } else {
      for (let i = 0; i < stats.sessionHistory.length; i++) {
        const session = stats.sessionHistory[i];
        if (typeof session !== 'object' || session === null) {
          errors.push(`Session ${i} must be an object`);
          continue;
        }

        // Validate session properties
        if (!session.timestamp || Number.isNaN(new Date(session.timestamp).getTime())) {
          errors.push(`Session ${i} has invalid timestamp`);
          continue;
        }

        if (!Number.isInteger(session.difficulty) || session.difficulty < 2 || session.difficulty > 6) {
          errors.push(`Session ${i} has invalid difficulty`);
          continue;
        }

        if (typeof session.correct !== 'boolean') {
          errors.push(`Session ${i} has invalid correct value`);
          continue;
        }

        const notesValidation = validateNoteArray(session.notesPlayed || []);
        const answerValidation = validateNoteArray(session.userAnswer || []);

        if (!notesValidation.isValid || !answerValidation.isValid) {
          errors.push(`Session ${i} has invalid notes`);
          continue;
        }

        validatedStats.sessionHistory.push({
          timestamp: new Date(session.timestamp),
          difficulty: session.difficulty,
          correct: session.correct,
          notesPlayed: notesValidation.validNotes,
          userAnswer: answerValidation.validNotes,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedStats,
  };
}

// Utility function to generate random notes for testing
export function generateRandomNotes(count: number): Note[] {
  if (count < 1 || count > 6) {
    throw new Error('Note count must be between 1 and 6');
  }

  const shuffled = [...AVAILABLE_NOTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Utility function to compare note arrays (for answer checking)
export function compareNoteArrays(notes1: Note[], notes2: Note[]): boolean {
  if (notes1.length !== notes2.length) {
    return false;
  }

  const sorted1 = [...notes1].sort();
  const sorted2 = [...notes2].sort();

  return sorted1.every((note, index) => note === sorted2[index]);
}
