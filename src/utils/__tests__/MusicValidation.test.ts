import type { GameSettings } from '@/types/MusicTypes';
import { describe, expect, it } from 'vitest';
import {
  compareNoteArrays,
  generateRandomNotes,
  isValidNote,
  isValidNoteName,
  isValidOctave,
  parseNote,
  validateGameSettings,
  validateNoteArray,
} from '../MusicValidation';

describe('MusicValidation', () => {
  describe('isValidNote', () => {
    it('should validate correct notes', () => {
      expect(isValidNote('C4')).toBe(true);
      expect(isValidNote('F#5')).toBe(true);
      expect(isValidNote('A3')).toBe(true);
    });

    it('should reject invalid notes', () => {
      expect(isValidNote('H4')).toBe(false);
      expect(isValidNote('C7')).toBe(false);
      expect(isValidNote('X#4')).toBe(false);
    });
  });

  describe('isValidNoteName', () => {
    it('should validate correct note names', () => {
      expect(isValidNoteName('C')).toBe(true);
      expect(isValidNoteName('F#')).toBe(true);
      expect(isValidNoteName('A#')).toBe(true);
    });

    it('should reject invalid note names', () => {
      expect(isValidNoteName('H')).toBe(false);
      expect(isValidNoteName('X')).toBe(false);
    });
  });

  describe('isValidOctave', () => {
    it('should validate correct octaves', () => {
      expect(isValidOctave(3)).toBe(true);
      expect(isValidOctave(4)).toBe(true);
      expect(isValidOctave(5)).toBe(true);
      expect(isValidOctave(6)).toBe(true);
    });

    it('should reject invalid octaves', () => {
      expect(isValidOctave(2)).toBe(false);
      expect(isValidOctave(7)).toBe(false);
    });
  });

  describe('parseNote', () => {
    it('should parse valid notes correctly', () => {
      expect(parseNote('C4')).toEqual({ noteName: 'C', octave: 4 });
      expect(parseNote('F#5')).toEqual({ noteName: 'F#', octave: 5 });
    });

    it('should return null for invalid notes', () => {
      expect(parseNote('H4')).toBeNull();
      expect(parseNote('C7')).toBeNull();
      expect(parseNote('C')).toBeNull();
    });
  });

  describe('validateGameSettings', () => {
    it('should validate correct settings', () => {
      const settings: Partial<GameSettings> = {
        noteCount: 4,
        volume: 0.8,
        autoReplay: true,
      };

      const result = validateGameSettings(settings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validatedSettings.noteCount).toBe(4);
    });

    it('should reject invalid note count', () => {
      const settings = { noteCount: 7 };
      const result = validateGameSettings(settings);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Note count must be an integer between 2 and 6');
    });

    it('should reject invalid volume', () => {
      const settings = { volume: 1.5 };
      const result = validateGameSettings(settings);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Volume must be a number between 0 and 1');
    });
  });

  describe('validateNoteArray', () => {
    it('should validate correct note arrays', () => {
      const notes = ['C4', 'E4', 'G4'];
      const result = validateNoteArray(notes);

      expect(result.isValid).toBe(true);
      expect(result.validNotes).toEqual(['C4', 'E4', 'G4']);
    });

    it('should reject arrays with invalid notes', () => {
      const notes = ['C4', 'H4', 'G4'];
      const result = validateNoteArray(notes);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid note: H4');
    });

    it('should reject duplicate notes', () => {
      const notes = ['C4', 'C4', 'G4'];
      const result = validateNoteArray(notes);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate notes are not allowed');
    });
  });

  describe('generateRandomNotes', () => {
    it('should generate the correct number of notes', () => {
      const notes = generateRandomNotes(3);

      expect(notes).toHaveLength(3);
      expect(notes.every(note => isValidNote(note))).toBe(true);
    });

    it('should throw error for invalid count', () => {
      expect(() => generateRandomNotes(0)).toThrow();
      expect(() => generateRandomNotes(7)).toThrow();
    });
  });

  describe('compareNoteArrays', () => {
    it('should return true for identical arrays', () => {
      expect(compareNoteArrays(['C4', 'E4'], ['C4', 'E4'])).toBe(true);
      expect(compareNoteArrays(['E4', 'C4'], ['C4', 'E4'])).toBe(true);
    });

    it('should return false for different arrays', () => {
      expect(compareNoteArrays(['C4', 'E4'], ['C4', 'F4'])).toBe(false);
      expect(compareNoteArrays(['C4'], ['C4', 'E4'])).toBe(false);
    });
  });
});
