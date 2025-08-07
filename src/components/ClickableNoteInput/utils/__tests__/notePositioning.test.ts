import { describe, expect, it } from 'vitest';
import {
  linePositionToPitch,
  pitchToLinePosition,
  requiresLedgerLine,
  detectAccidental,
  isOnStaffLine,
  getNoteName,
  getOctave,
  isValidPitch,
  getStaffLinePositions,
  getStaffSpacePositions,
} from '../notePositioning';

describe('notePositioning', () => {
  describe('linePositionToPitch', () => {
    it('should convert staff line positions to correct pitches', () => {
      expect(linePositionToPitch(0)).toBe('E4'); // Bottom line
      expect(linePositionToPitch(2)).toBe('G4'); // Second line
      expect(linePositionToPitch(4)).toBe('B4'); // Middle line
      expect(linePositionToPitch(6)).toBe('D5'); // Fourth line
      expect(linePositionToPitch(8)).toBe('F5'); // Top line
    });

    it('should convert staff space positions to correct pitches', () => {
      expect(linePositionToPitch(1)).toBe('F4'); // First space
      expect(linePositionToPitch(3)).toBe('A4'); // Second space
      expect(linePositionToPitch(5)).toBe('C5'); // Third space
      expect(linePositionToPitch(7)).toBe('E5'); // Fourth space
    });

    it('should handle ledger line positions', () => {
      expect(linePositionToPitch(-4)).toBe('D4'); // Below staff
      expect(linePositionToPitch(10)).toBe('G5'); // Above staff
    });
  });

  describe('pitchToLinePosition', () => {
    it('should convert pitches to correct line positions', () => {
      expect(pitchToLinePosition('E4')).toBe(0);
      expect(pitchToLinePosition('F4')).toBe(1);
      expect(pitchToLinePosition('G4')).toBe(2);
      expect(pitchToLinePosition('A4')).toBe(3);
      expect(pitchToLinePosition('B4')).toBe(4);
      expect(pitchToLinePosition('C5')).toBe(5);
    });
  });

  describe('requiresLedgerLine', () => {
    it('should return false for positions on the staff', () => {
      expect(requiresLedgerLine(0)).toBe(false);
      expect(requiresLedgerLine(4)).toBe(false);
      expect(requiresLedgerLine(8)).toBe(false);
    });

    it('should return true for positions requiring ledger lines', () => {
      expect(requiresLedgerLine(-1)).toBe(true);
      expect(requiresLedgerLine(9)).toBe(true);
      expect(requiresLedgerLine(-6)).toBe(true);
      expect(requiresLedgerLine(14)).toBe(true);
    });
  });

  describe('detectAccidental', () => {
    it('should detect sharp accidentals', () => {
      expect(detectAccidental('F#4')).toBe('sharp');
      expect(detectAccidental('C#5')).toBe('sharp');
    });

    it('should detect flat accidentals', () => {
      expect(detectAccidental('Bb4')).toBe('flat');
      expect(detectAccidental('Eb5')).toBe('flat');
    });

    it('should return undefined for natural notes', () => {
      expect(detectAccidental('C4')).toBeUndefined();
      expect(detectAccidental('G5')).toBeUndefined();
    });
  });

  describe('isOnStaffLine', () => {
    it('should return true for line positions', () => {
      expect(isOnStaffLine(0)).toBe(true); // Bottom line
      expect(isOnStaffLine(2)).toBe(true); // Second line
      expect(isOnStaffLine(4)).toBe(true); // Middle line
    });

    it('should return false for space positions', () => {
      expect(isOnStaffLine(1)).toBe(false); // First space
      expect(isOnStaffLine(3)).toBe(false); // Second space
      expect(isOnStaffLine(5)).toBe(false); // Third space
    });
  });

  describe('getNoteName', () => {
    it('should extract note name from pitch', () => {
      expect(getNoteName('C4')).toBe('C');
      expect(getNoteName('F#5')).toBe('F');
      expect(getNoteName('Bb3')).toBe('B');
    });
  });

  describe('getOctave', () => {
    it('should extract octave number from pitch', () => {
      expect(getOctave('C4')).toBe(4);
      expect(getOctave('F#5')).toBe(5);
      expect(getOctave('Bb3')).toBe(3);
    });
  });

  describe('isValidPitch', () => {
    it('should return true for valid pitches', () => {
      expect(isValidPitch('C4')).toBe(true);
      expect(isValidPitch('E4')).toBe(true);
      expect(isValidPitch('F5')).toBe(true);
    });
  });

  describe('getStaffLinePositions', () => {
    it('should return correct staff line positions', () => {
      const positions = getStaffLinePositions();
      expect(positions).toEqual([0, 2, 4, 6, 8]);
    });
  });

  describe('getStaffSpacePositions', () => {
    it('should return correct staff space positions', () => {
      const positions = getStaffSpacePositions();
      expect(positions).toEqual([1, 3, 5, 7]);
    });
  });
});