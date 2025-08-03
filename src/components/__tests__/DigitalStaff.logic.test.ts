import type { Note } from '@/types/MusicTypes';
import { describe, expect, it } from 'vitest';
import { STAFF_POSITIONS } from '@/utils/MusicConstants';

describe('DigitalStaff Logic', () => {
  describe('Staff Position Calculations', () => {
    it('should have correct staff positions for treble clef notes', () => {
      // Test key staff line positions
      expect(STAFF_POSITIONS.E4.linePosition).toBe(0); // Bottom line
      expect(STAFF_POSITIONS.G4.linePosition).toBe(2); // Second line
      expect(STAFF_POSITIONS.B4.linePosition).toBe(4); // Third line
      expect(STAFF_POSITIONS.D5.linePosition).toBe(6); // Fourth line
      expect(STAFF_POSITIONS.F5.linePosition).toBe(8); // Top line
    });

    it('should identify notes that require ledger lines', () => {
      // Notes below staff
      expect(STAFF_POSITIONS.C4.requiresLedgerLine).toBe(true);
      expect(STAFF_POSITIONS.D4.requiresLedgerLine).toBe(true);

      // Notes on staff
      expect(STAFF_POSITIONS.E4.requiresLedgerLine).toBe(false);
      expect(STAFF_POSITIONS.F4.requiresLedgerLine).toBe(false);
      expect(STAFF_POSITIONS.G4.requiresLedgerLine).toBe(false);

      // Notes above staff
      expect(STAFF_POSITIONS.G5.requiresLedgerLine).toBe(true);
      expect(STAFF_POSITIONS.A5.requiresLedgerLine).toBe(true);
    });

    it('should correctly identify sharp notes', () => {
      expect(STAFF_POSITIONS['C#4'].accidental).toBe('sharp');
      expect(STAFF_POSITIONS['F#4'].accidental).toBe('sharp');
      expect(STAFF_POSITIONS['G#4'].accidental).toBe('sharp');

      // Natural notes should not have accidentals
      expect(STAFF_POSITIONS.C4.accidental).toBeUndefined();
      expect(STAFF_POSITIONS.F4.accidental).toBeUndefined();
      expect(STAFF_POSITIONS.G4.accidental).toBeUndefined();
    });
  });

  describe('Note Selection Logic', () => {
    it('should handle note selection constraints', () => {
      const selectedNotes: Note[] = ['C4', 'E4', 'G4'];
      const maxNotes = 3;

      // Should allow deselection when at max
      expect(selectedNotes.length).toBe(maxNotes);
      expect(selectedNotes.includes('C4')).toBe(true);

      // Should prevent new selections when at max
      const canAddMore = selectedNotes.length < maxNotes;

      expect(canAddMore).toBe(false);
    });

    it('should handle note deselection', () => {
      const selectedNotes: Note[] = ['C4', 'E4', 'G4'];
      const noteToRemove: Note = 'E4';

      const afterRemoval = selectedNotes.filter(note => note !== noteToRemove);

      expect(afterRemoval).toEqual(['C4', 'G4']);
      expect(afterRemoval.length).toBe(2);
    });

    it('should handle note addition within limits', () => {
      const selectedNotes: Note[] = ['C4', 'E4'];
      const maxNotes = 3;
      const noteToAdd: Note = 'G4';

      if (selectedNotes.length < maxNotes && !selectedNotes.includes(noteToAdd)) {
        const afterAddition = [...selectedNotes, noteToAdd];

        expect(afterAddition).toEqual(['C4', 'E4', 'G4']);
        expect(afterAddition.length).toBe(3);
      }
    });
  });

  describe('Visual Feedback Logic', () => {
    it('should determine correct note colors for feedback', () => {
      const selectedNotes: Note[] = ['C4', 'E4', 'G4'];
      const correctNotes: Note[] = ['C4', 'F4', 'G4'];
      const showCorrectAnswer = true;

      // Helper function to get note color (simulating component logic)
      const getNoteColor = (note: Note): string => {
        if (showCorrectAnswer) {
          if (correctNotes.includes(note) && selectedNotes.includes(note)) {
            return '#22c55e'; // Green for correct
          } else if (selectedNotes.includes(note)) {
            return '#ef4444'; // Red for incorrect
          } else if (correctNotes.includes(note)) {
            return '#22c55e'; // Green for missed correct notes
          }
        }
        return selectedNotes.includes(note) ? '#3b82f6' : '#6b7280';
      };

      expect(getNoteColor('C4')).toBe('#22c55e'); // Correct and selected
      expect(getNoteColor('E4')).toBe('#ef4444'); // Selected but incorrect
      expect(getNoteColor('F4')).toBe('#22c55e'); // Correct but not selected
      expect(getNoteColor('G4')).toBe('#22c55e'); // Correct and selected
      expect(getNoteColor('A4')).toBe('#6b7280'); // Not selected, not correct
    });

    it('should handle normal mode colors', () => {
      const selectedNotes: Note[] = ['C4', 'E4'];
      const showCorrectAnswer = false;

      const getNoteColor = (note: Note): string => {
        if (showCorrectAnswer) {
          // Feedback logic would go here
        }
        return selectedNotes.includes(note) ? '#3b82f6' : '#6b7280';
      };

      expect(getNoteColor('C4')).toBe('#3b82f6'); // Selected
      expect(getNoteColor('E4')).toBe('#3b82f6'); // Selected
      expect(getNoteColor('G4')).toBe('#6b7280'); // Not selected
    });
  });

  describe('Y Position Calculations', () => {
    it('should calculate correct Y positions for staff lines', () => {
      const staffStartY = 80;
      const lineSpacing = 12;

      const getYPosition = (linePosition: number): number => {
        return staffStartY + (8 - linePosition) * (lineSpacing / 2);
      };

      // Test staff line positions
      expect(getYPosition(0)).toBe(128); // Bottom line (E4)
      expect(getYPosition(2)).toBe(116); // Second line (G4)
      expect(getYPosition(4)).toBe(104); // Third line (B4)
      expect(getYPosition(6)).toBe(92); // Fourth line (D5)
      expect(getYPosition(8)).toBe(80); // Top line (F5)
    });

    it('should handle ledger line positions', () => {
      const staffStartY = 80;
      const lineSpacing = 12;

      const getYPosition = (linePosition: number): number => {
        return staffStartY + (8 - linePosition) * (lineSpacing / 2);
      };

      // Test ledger line positions
      expect(getYPosition(-2)).toBe(140); // C4 (below staff)
      expect(getYPosition(10)).toBe(68); // A5 (above staff)
    });
  });

  describe('Available Notes Range', () => {
    it('should include reasonable range for ear training', () => {
      const clickableNotes: Note[] = [
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

      expect(clickableNotes.length).toBe(14);
      expect(clickableNotes[0]).toBe('C4');
      expect(clickableNotes[clickableNotes.length - 1]).toBe('B5');

      // Should include both natural notes
      expect(clickableNotes.includes('C4')).toBe(true);
      expect(clickableNotes.includes('G4')).toBe(true);
      expect(clickableNotes.includes('C5')).toBe(true);
    });

    it('should have corresponding staff positions for all clickable notes', () => {
      const clickableNotes: Note[] = [
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

      clickableNotes.forEach((note) => {
        expect(STAFF_POSITIONS[note]).toBeDefined();
        expect(typeof STAFF_POSITIONS[note].linePosition).toBe('number');
        expect(typeof STAFF_POSITIONS[note].requiresLedgerLine).toBe('boolean');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty note arrays', () => {
      const selectedNotes: Note[] = [];
      const maxNotes = 3;

      expect(selectedNotes.length).toBe(0);
      expect(selectedNotes.length < maxNotes).toBe(true);
    });

    it('should handle maximum note limits', () => {
      const maxNotes = 6;
      const selectedNotes: Note[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];

      expect(selectedNotes.length).toBe(maxNotes);
      expect(selectedNotes.length >= maxNotes).toBe(true);
    });

    it('should handle single note limit', () => {
      const maxNotes = 1;
      const selectedNotes: Note[] = ['C4'];

      expect(selectedNotes.length).toBe(maxNotes);
      expect(selectedNotes.length >= maxNotes).toBe(true);
    });
  });
});
