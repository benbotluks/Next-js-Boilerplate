import { describe, expect, it } from 'vitest';
import type { Note } from '@/types/MusicTypes';
import {
  generateFeedbackMessage,
  getNoteDisplayColor,
  validateAnswer,
} from '../AnswerValidation';

describe('AnswerValidation', () => {
  describe('validateAnswer', () => {
    it('returns correct result for perfect match', () => {
      const correctNotes: Note[] = ['C4', 'E4', 'G4'];
      const selectedNotes: Note[] = ['C4', 'E4', 'G4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(true);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.selectedNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.correctlyIdentified).toEqual(['C4', 'E4', 'G4']);
      expect(result.missedNotes).toEqual([]);
      expect(result.incorrectNotes).toEqual([]);
      expect(result.accuracy).toBe(100);
    });

    it('returns correct result for perfect match with different order', () => {
      const correctNotes: Note[] = ['G4', 'C4', 'E4'];
      const selectedNotes: Note[] = ['C4', 'E4', 'G4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(true);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']); // Sorted
      expect(result.selectedNotes).toEqual(['C4', 'E4', 'G4']); // Sorted
      expect(result.correctlyIdentified).toEqual(['C4', 'E4', 'G4']);
      expect(result.missedNotes).toEqual([]);
      expect(result.incorrectNotes).toEqual([]);
      expect(result.accuracy).toBe(100);
    });

    it('handles partial correct answers', () => {
      const correctNotes: Note[] = ['C4', 'E4', 'G4'];
      const selectedNotes: Note[] = ['C4', 'E4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(false);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.selectedNotes).toEqual(['C4', 'E4']);
      expect(result.correctlyIdentified).toEqual(['C4', 'E4']);
      expect(result.missedNotes).toEqual(['G4']);
      expect(result.incorrectNotes).toEqual([]);
      expect(result.accuracy).toBe(67); // 2/3 * 100 rounded
    });

    it('handles incorrect selections', () => {
      const correctNotes: Note[] = ['C4', 'E4', 'G4'];
      const selectedNotes: Note[] = ['C4', 'F4', 'A4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(false);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.selectedNotes).toEqual(['A4', 'C4', 'F4']); // Sorted
      expect(result.correctlyIdentified).toEqual(['C4']);
      expect(result.missedNotes).toEqual(['E4', 'G4']);
      expect(result.incorrectNotes).toEqual(['A4', 'F4']);
      expect(result.accuracy).toBe(33); // 1/3 * 100 rounded
    });

    it('handles completely wrong answers', () => {
      const correctNotes: Note[] = ['C4', 'E4', 'G4'];
      const selectedNotes: Note[] = ['D4', 'F4', 'A4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(false);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.selectedNotes).toEqual(['A4', 'D4', 'F4']); // Sorted
      expect(result.correctlyIdentified).toEqual([]);
      expect(result.missedNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.incorrectNotes).toEqual(['A4', 'D4', 'F4']);
      expect(result.accuracy).toBe(0);
    });

    it('handles too many selections', () => {
      const correctNotes: Note[] = ['C4', 'E4'];
      const selectedNotes: Note[] = ['C4', 'E4', 'G4', 'A4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(false);
      expect(result.correctNotes).toEqual(['C4', 'E4']);
      expect(result.selectedNotes).toEqual(['A4', 'C4', 'E4', 'G4']); // Sorted
      expect(result.correctlyIdentified).toEqual(['C4', 'E4']);
      expect(result.missedNotes).toEqual([]);
      expect(result.incorrectNotes).toEqual(['A4', 'G4']);
      expect(result.accuracy).toBe(100); // All correct notes identified
    });

    it('handles empty selections', () => {
      const correctNotes: Note[] = ['C4', 'E4', 'G4'];
      const selectedNotes: Note[] = [];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(false);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.selectedNotes).toEqual([]);
      expect(result.correctlyIdentified).toEqual([]);
      expect(result.missedNotes).toEqual(['C4', 'E4', 'G4']);
      expect(result.incorrectNotes).toEqual([]);
      expect(result.accuracy).toBe(0);
    });

    it('handles duplicate notes in input', () => {
      const correctNotes: Note[] = ['C4', 'E4', 'G4', 'C4']; // Duplicate
      const selectedNotes: Note[] = ['C4', 'E4', 'G4', 'E4']; // Duplicate

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(true);
      expect(result.correctNotes).toEqual(['C4', 'E4', 'G4']); // Deduplicated
      expect(result.selectedNotes).toEqual(['C4', 'E4', 'G4']); // Deduplicated
      expect(result.correctlyIdentified).toEqual(['C4', 'E4', 'G4']);
      expect(result.missedNotes).toEqual([]);
      expect(result.incorrectNotes).toEqual([]);
      expect(result.accuracy).toBe(100);
    });

    it('handles single note scenarios', () => {
      const correctNotes: Note[] = ['C4'];
      const selectedNotes: Note[] = ['C4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(true);
      expect(result.accuracy).toBe(100);
    });

    it('handles edge case with empty correct notes', () => {
      const correctNotes: Note[] = [];
      const selectedNotes: Note[] = ['C4'];

      const result = validateAnswer(correctNotes, selectedNotes);

      expect(result.isCorrect).toBe(false);
      expect(result.correctNotes).toEqual([]);
      expect(result.selectedNotes).toEqual(['C4']);
      expect(result.correctlyIdentified).toEqual([]);
      expect(result.missedNotes).toEqual([]);
      expect(result.incorrectNotes).toEqual(['C4']);
      expect(result.accuracy).toBe(0);
    });
  });

  describe('generateFeedbackMessage', () => {
    it('generates correct message for perfect answer', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']);
      const message = generateFeedbackMessage(result);

      expect(message).toBe('Perfect! You identified all notes correctly.');
    });

    it('generates correct message for partial answer', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'E4']);
      const message = generateFeedbackMessage(result);

      expect(message).toBe(
        'You correctly identified 2 out of 3 notes. You missed: G4.',
      );
    });

    it('generates correct message for incorrect selections', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'F4', 'A4']);
      const message = generateFeedbackMessage(result);

      expect(message).toBe(
        'You correctly identified 1 out of 3 notes. You missed: E4, G4. Incorrect selections: A4, F4.',
      );
    });

    it('generates correct message for completely wrong answer', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['D4', 'F4', 'A4']);
      const message = generateFeedbackMessage(result);

      expect(message).toBe(
        'You missed: C4, E4, G4. Incorrect selections: A4, D4, F4.',
      );
    });

    it('generates correct message for too many selections', () => {
      const result = validateAnswer(['C4', 'E4'], ['C4', 'E4', 'G4', 'A4']);
      const message = generateFeedbackMessage(result);

      expect(message).toBe(
        'You correctly identified 2 out of 2 notes. Incorrect selections: A4, G4.',
      );
    });
  });

  describe('getNoteDisplayColor', () => {
    it('returns green for correctly identified notes', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']);
      const color = getNoteDisplayColor('C4', result);

      expect(color.color).toBe('#22c55e');
      expect(color.label).toBe('Correct');
    });

    it('returns red for incorrect selections', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'F4']);
      const color = getNoteDisplayColor('F4', result);

      expect(color.color).toBe('#ef4444');
      expect(color.label).toBe('Incorrect');
    });

    it('returns amber for missed notes', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4']);
      const color = getNoteDisplayColor('E4', result);

      expect(color.color).toBe('#f59e0b');
      expect(color.label).toBe('Missed');
    });

    it('returns gray for unselected notes', () => {
      const result = validateAnswer(['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']);
      const color = getNoteDisplayColor('D4', result);

      expect(color.color).toBe('#6b7280');
      expect(color.label).toBe('Unselected');
    });
  });
});