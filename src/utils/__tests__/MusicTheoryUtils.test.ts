import type { Note } from '@/types/MusicTypes';
import { describe, expect, it } from 'vitest';
import {
  AVAILABLE_NOTES,
  DEFAULT_SETTINGS,
  MusicTheoryUtils,
  NOTE_FREQUENCIES,
  STAFF_POSITIONS,
} from '../MusicTheoryUtils';

describe('MusicTheoryUtils', () => {
  describe('NOTE_FREQUENCIES', () => {
    it('should generate frequencies for all supported notes', () => {
      // Test a few known frequencies
      expect(NOTE_FREQUENCIES.A4).toBeCloseTo(440.0, 1);
      expect(NOTE_FREQUENCIES.C4).toBeCloseTo(261.63, 1);
      expect(NOTE_FREQUENCIES.C5).toBeCloseTo(523.25, 1);
    });

    it('should have frequencies for all octaves 3-6', () => {
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octaves = [3, 4, 5, 6];

      for (const octave of octaves) {
        for (const noteName of noteNames) {
          const note = `${noteName}${octave}` as Note;

          expect(NOTE_FREQUENCIES[note]).toBeDefined();
          expect(NOTE_FREQUENCIES[note]).toBeGreaterThan(0);
        }
      }
    });

    it('should have frequencies in ascending order within octaves', () => {
      expect(NOTE_FREQUENCIES.C4).toBeLessThan(NOTE_FREQUENCIES.D4);
      expect(NOTE_FREQUENCIES.D4).toBeLessThan(NOTE_FREQUENCIES.E4);
      expect(NOTE_FREQUENCIES.B4).toBeLessThan(NOTE_FREQUENCIES.C5);
    });
  });

  describe('STAFF_POSITIONS', () => {
    it('should maintain staff position mappings', () => {
      expect(STAFF_POSITIONS.E4.linePosition).toBe(0); // Bottom line
      expect(STAFF_POSITIONS.F5.linePosition).toBe(8); // Top line
      expect(STAFF_POSITIONS.C4.requiresLedgerLine).toBe(true);
      expect(STAFF_POSITIONS.G4.requiresLedgerLine).toBe(false);
    });

    it('should have correct accidental markings', () => {
      expect(STAFF_POSITIONS['C#4'].accidental).toBe('sharp');
      expect(STAFF_POSITIONS['F#4'].accidental).toBe('sharp');
      expect(STAFF_POSITIONS.C4.accidental).toBeUndefined();
    });
  });

  describe('AVAILABLE_NOTES', () => {
    it('should contain reasonable range for ear training', () => {
      expect(AVAILABLE_NOTES).toContain('C4');
      expect(AVAILABLE_NOTES).toContain('B5');
      expect(AVAILABLE_NOTES.length).toBeGreaterThan(10);
    });

    it('should not contain sharps/flats for simplicity', () => {
      const hasAccidentals = AVAILABLE_NOTES.some(note => note.includes('#'));

      expect(hasAccidentals).toBe(false);
    });
  });

  describe('getNoteFrequency', () => {
    it('should return correct frequencies for known notes', () => {
      expect(MusicTheoryUtils.getNoteFrequency('A4')).toBeCloseTo(440.0, 1);
      expect(MusicTheoryUtils.getNoteFrequency('C4')).toBeCloseTo(261.63, 1);
      expect(MusicTheoryUtils.getNoteFrequency('C5')).toBeCloseTo(523.25, 1);
    });

    it('should throw error for invalid notes', () => {
      expect(() => MusicTheoryUtils.getNoteFrequency('X4' as Note)).toThrow('Invalid note');
    });

    it('should match NOTE_FREQUENCIES mapping', () => {
      const testNotes: Note[] = ['C4', 'F#4', 'A4', 'B5'];
      for (const note of testNotes) {
        expect(MusicTheoryUtils.getNoteFrequency(note)).toBe(NOTE_FREQUENCIES[note]);
      }
    });
  });

  describe('isValidNote', () => {
    it('should validate correct notes', () => {
      expect(MusicTheoryUtils.isValidNote('C4')).toBe(true);
      expect(MusicTheoryUtils.isValidNote('F#5')).toBe(true);
      expect(MusicTheoryUtils.isValidNote('B3')).toBe(true);
      expect(MusicTheoryUtils.isValidNote('A6')).toBe(true);
    });

    it('should reject invalid notes', () => {
      expect(MusicTheoryUtils.isValidNote('X4')).toBe(false);
      expect(MusicTheoryUtils.isValidNote('C')).toBe(false);
      expect(MusicTheoryUtils.isValidNote('4')).toBe(false);
      expect(MusicTheoryUtils.isValidNote('')).toBe(false);
    });

    it('should reject notes outside supported range', () => {
      expect(MusicTheoryUtils.isValidNote('C2')).toBe(false);
      expect(MusicTheoryUtils.isValidNote('C7')).toBe(false);
    });
  });

  describe('transposeNote', () => {
    it('should transpose notes correctly', () => {
      expect(MusicTheoryUtils.transposeNote('C4', 12)).toBe('C5'); // Up one octave
      expect(MusicTheoryUtils.transposeNote('C5', -12)).toBe('C4'); // Down one octave
      expect(MusicTheoryUtils.transposeNote('C4', 1)).toBe('C#4'); // Up one semitone
      expect(MusicTheoryUtils.transposeNote('C#4', -1)).toBe('C4'); // Down one semitone
    });

    it('should handle cross-octave transposition', () => {
      expect(MusicTheoryUtils.transposeNote('B4', 1)).toBe('C5');
      expect(MusicTheoryUtils.transposeNote('C5', -1)).toBe('B4');
    });

    it('should throw error when transposing out of range', () => {
      expect(() => MusicTheoryUtils.transposeNote('C6', 12)).toThrow('out of supported range');
      expect(() => MusicTheoryUtils.transposeNote('C3', -12)).toThrow('out of supported range');
    });
  });

  describe('getRandomNoteSet', () => {
    it('should generate requested number of notes', () => {
      const notes = MusicTheoryUtils.getRandomNoteSet(3);

      expect(notes).toHaveLength(3);
    });

    it('should generate unique notes', () => {
      const notes = MusicTheoryUtils.getRandomNoteSet(5);
      const uniqueNotes = new Set(notes);

      expect(uniqueNotes.size).toBe(5);
    });

    it('should use provided range', () => {
      const customRange: Note[] = ['C4', 'D4', 'E4'];
      const notes = MusicTheoryUtils.getRandomNoteSet(2, customRange);

      expect(notes).toHaveLength(2);

      notes.forEach((note) => {
        expect(customRange).toContain(note);
      });
    });

    it('should throw error when requesting more notes than available', () => {
      const smallRange: Note[] = ['C4', 'D4'];

      expect(() => MusicTheoryUtils.getRandomNoteSet(3, smallRange)).toThrow('Cannot generate 3 unique notes');
    });

    it('should use AVAILABLE_NOTES as default range', () => {
      const notes = MusicTheoryUtils.getRandomNoteSet(3);
      notes.forEach((note) => {
        expect(AVAILABLE_NOTES).toContain(note);
      });
    });
  });

  describe('getNotesInOctave', () => {
    it('should return all 12 notes in an octave', () => {
      const octave4Notes = MusicTheoryUtils.getNotesInOctave(4);

      expect(octave4Notes).toHaveLength(12);
      expect(octave4Notes).toContain('C4');
      expect(octave4Notes).toContain('C#4');
      expect(octave4Notes).toContain('B4');
    });

    it('should work for all supported octaves', () => {
      const octaves: (3 | 4 | 5 | 6)[] = [3, 4, 5, 6];
      for (const octave of octaves) {
        const notes = MusicTheoryUtils.getNotesInOctave(octave);

        expect(notes).toHaveLength(12);
        expect(notes[0]).toBe(`C${octave}`);
        expect(notes[11]).toBe(`B${octave}`);
      }
    });
  });

  describe('getNoteOctave', () => {
    it('should extract octave from note', () => {
      expect(MusicTheoryUtils.getNoteOctave('C4')).toBe(4);
      expect(MusicTheoryUtils.getNoteOctave('F#5')).toBe(5);
      expect(MusicTheoryUtils.getNoteOctave('B3')).toBe(3);
    });
  });

  describe('getNoteName', () => {
    it('should extract note name without octave', () => {
      expect(MusicTheoryUtils.getNoteName('C4')).toBe('C');
      expect(MusicTheoryUtils.getNoteName('F#5')).toBe('F#');
      expect(MusicTheoryUtils.getNoteName('B3')).toBe('B');
    });
  });

  describe('hasAccidental', () => {
    it('should detect sharp notes', () => {
      expect(MusicTheoryUtils.hasAccidental('C#4')).toBe(true);
      expect(MusicTheoryUtils.hasAccidental('F#5')).toBe(true);
    });

    it('should detect natural notes', () => {
      expect(MusicTheoryUtils.hasAccidental('C4')).toBe(false);
      expect(MusicTheoryUtils.hasAccidental('F5')).toBe(false);
    });
  });

  describe('getEnharmonic', () => {
    it('should return enharmonic equivalents when available', () => {
      // Note: This depends on Tonal's enharmonic implementation
      // Some enharmonics might not be in our supported range
      const enharmonic = MusicTheoryUtils.getEnharmonic('C#4');
      if (enharmonic) {
        expect(MusicTheoryUtils.isValidNote(enharmonic)).toBe(true);
      }
    });

    it('should return null for notes without enharmonics in range', () => {
      const enharmonic = MusicTheoryUtils.getEnharmonic('C4');

      expect(enharmonic).toBeNull();
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should maintain backward compatibility', () => {
      expect(DEFAULT_SETTINGS.noteCount).toBe(3);
      expect(DEFAULT_SETTINGS.volume).toBe(0.7);
      expect(DEFAULT_SETTINGS.autoReplay).toBe(false);
    });
  });
});

describe('Integration with existing types', () => {
  it('should work with existing Note type', () => {
    const note: Note = 'C4';

    expect(MusicTheoryUtils.isValidNote(note)).toBe(true);
    expect(MusicTheoryUtils.getNoteFrequency(note)).toBeGreaterThan(0);
  });

  it('should maintain compatibility with STAFF_POSITIONS', () => {
    const testNotes: Note[] = ['C4', 'E4', 'G4', 'C5'];
    for (const note of testNotes) {
      expect(STAFF_POSITIONS[note]).toBeDefined();
      expect(STAFF_POSITIONS[note].note).toBe(note);
    }
  });
});
