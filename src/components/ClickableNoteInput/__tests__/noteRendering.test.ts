import { describe, expect, it } from 'vitest';
import { createStaveNote, getNoteStyle, NOTE_STYLES, calculateNoteSpacing } from '../utils/noteRendering';

describe('noteRendering', () => {
  describe('createStaveNote', () => {
    it('creates a StaveNote from a pitch', () => {
      const note = createStaveNote('C4');
      expect(note).toBeDefined();
      expect(note.keys).toEqual(['c/4']);
    });

    it('handles sharps and flats', () => {
      const sharpNote = createStaveNote('F#5');
      expect(sharpNote.keys).toEqual(['f#/5']);

      const flatNote = createStaveNote('Bb3');
      expect(flatNote.keys).toEqual(['bb/3']);
    });
  });

  describe('getNoteStyle', () => {
    it('returns default style for unselected notes', () => {
      const style = getNoteStyle('C4', [], [], null, false);
      expect(style).toEqual(NOTE_STYLES.default);
    });

    it('returns selected style for selected notes', () => {
      const style = getNoteStyle('C4', ['C4'], [], null, false);
      expect(style).toEqual(NOTE_STYLES.selected);
    });

    it('returns hovered style for hovered notes', () => {
      const style = getNoteStyle('C4', [], [], 'C4', false);
      expect(style).toEqual(NOTE_STYLES.hovered);
    });

    it('returns correct style when showing correct answers', () => {
      const style = getNoteStyle('C4', ['C4'], ['C4'], null, true);
      expect(style).toEqual(NOTE_STYLES.correct);
    });

    it('returns incorrect style for wrong selected notes', () => {
      const style = getNoteStyle('C4', ['C4'], ['D4'], null, true);
      expect(style).toEqual(NOTE_STYLES.incorrect);
    });
  });

  describe('calculateNoteSpacing', () => {
    it('calculates appropriate spacing for multiple notes', () => {
      const spacing = calculateNoteSpacing(3, 300);
      expect(spacing).toBeGreaterThan(40);
      expect(spacing).toBeLessThan(80);
    });

    it('handles single note case', () => {
      const spacing = calculateNoteSpacing(1, 300);
      expect(spacing).toBe(150);
    });

    it('enforces minimum spacing', () => {
      const spacing = calculateNoteSpacing(10, 200);
      expect(spacing).toBe(40);
    });

    it('enforces maximum spacing', () => {
      const spacing = calculateNoteSpacing(2, 500);
      expect(spacing).toBe(80);
    });
  });
});