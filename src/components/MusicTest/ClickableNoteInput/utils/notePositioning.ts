import type { Note } from '@/types/MusicTypes';

/**
 * Utility functions for note positioning and pitch calculations
 */

/**
 * Treble clef pitch mapping for staff positions
 * Line positions: 0 = e/4 (bottom line), 2 = g/4, 4 = b/4, 6 = d/5, 8 = f/5 (top line)
 * Space positions: 1 = f/4, 3 = a/4, 5 = c/5, 7 = e/5
 * We avoid duplicate pitches by using different octaves for ledger lines
 */

const _NOTE_CLASSES: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const TREBLE_CLEF_PITCHES: Record<number, Note> = {
  // Below staff (ledger lines)
  '-4': 'a/3',
  '-3': 'b/3',
  '-2': 'c/4',
  '-1': 'd/4',
  '0': 'e/4', // Bottom line
  '1': 'f/4', // First space
  '2': 'g/4', // Second line
  '3': 'a/4', // Second space
  '4': 'b/4', // Middle line
  '5': 'c/5', // Third space
  '6': 'd/5', // Fourth line
  '7': 'e/5', // Fourth space
  '8': 'f/5', // Top line
  '9': 'g/5',
  '10': 'a/5',
  '11': 'b/5',
  '12': 'c/6',
};

/**
 * Reverse mapping from pitch to line position
 */
const PITCH_TO_LINE_POSITION: Partial<Record<Note, number>> = {};
Object.entries(TREBLE_CLEF_PITCHES).forEach(([linePos, pitch]) => {
  PITCH_TO_LINE_POSITION[pitch] = Number.parseInt(linePos);
});

/**
 * Determine if a staff position requires ledger lines
 */
export const requiresLedgerLine = (linePosition: number): boolean => {
  return linePosition < 0 || linePosition > 8;
};

/**
 * Calculate pitch based on staff line position
 */
export const linePositionToPitch = (linePosition: number): Note => {
  const pitch = TREBLE_CLEF_PITCHES[linePosition];
  if (pitch) {
    return pitch;
  }

  // For positions not in our mapping, extrapolate based on chromatic scale
  // This is a simplified approach for positions between our mapped values
  const basePositions = Object.keys(TREBLE_CLEF_PITCHES).map(Number).sort((a, b) => a - b);

  // Find the closest mapped position
  if (basePositions.length === 0 || !basePositions[0]) {
    return 'c/4'; // Fallback
  }

  let closestPos = basePositions[0];
  let minDistance = Math.abs(linePosition - closestPos);

  for (const pos of basePositions) {
    const distance = Math.abs(linePosition - pos);
    if (distance < minDistance) {
      minDistance = distance;
      closestPos = pos;
    }
  }

  return TREBLE_CLEF_PITCHES[closestPos] || 'c/4';
};

/**
 * Calculate staff line position from pitch
 */
export const pitchToLinePosition = (pitch: Note): number => {
  const linePosition = PITCH_TO_LINE_POSITION[pitch];
  if (linePosition !== undefined) {
    return linePosition;
  }

  // If pitch not found in mapping, try to parse and estimate
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (!match || !match[3]) {
    return 4; // Default to middle line (b/4)
  }

  const octaveNum = Number.parseInt(match[3]);

  // Basic estimation for unmapped pitches
  // This is a simplified approach - in a full implementation,
  // you'd want more sophisticated pitch-to-position mapping
  if (octaveNum < 4) {
    return 0; // Below staff
  } else if (octaveNum > 5) {
    return 8; // Above staff
  } else {
    return 4; // Middle area
  }
};

/**
 * Detect if a pitch needs an accidental
 */
export const detectAccidental = (pitch: Note): 'sharp' | 'flat' | 'natural' | undefined => {
  if (pitch.includes('#')) {
    return 'sharp';
  }
  if (pitch.includes('b')) {
    return 'flat';
  }
  return undefined;
};

/**
 * Get the octave number from a pitch
 */
export const getOctave = (pitch: Note): number => {
  const match = pitch.match(/(\d)$/);
  return (match && match[1]) ? Number.parseInt(match[1]) : 4;
};

/**
 * Check if a line position is on a staff line (vs space)
 */
export const isOnStaffLine = (linePosition: number): boolean => {
  return linePosition % 2 === 0;
};

/**
 * Get the next higher pitch from a given staff position
 */
export const getNextHigherPitch = (currentPosition: number): Note => {
  return linePositionToPitch(currentPosition + 1);
};

/**
 * Get the next lower pitch from a given staff position
 */
export const getNextLowerPitch = (currentPosition: number): Note => {
  return linePositionToPitch(currentPosition - 1);
};

/**
 * Calculate the visual offset needed for ledger lines
 */
export const getLedgerLineOffset = (linePosition: number): number => {
  if (linePosition < 0) {
    // Below staff - count how many ledger lines needed
    return Math.abs(Math.floor(linePosition / 2));
  } else if (linePosition > 8) {
    // Above staff - count how many ledger lines needed
    return Math.floor((linePosition - 8) / 2);
  }
  return 0;
};

/**
 * Get all pitches that should be displayed with ledger lines
 */
export const getLedgerLinePitches = (): Note[] => {
  const ledgerPitches: Note[] = [];

  // Below staff
  for (let pos = -6; pos < 0; pos += 2) {
    const pitch = TREBLE_CLEF_PITCHES[pos];
    if (pitch) {
      ledgerPitches.push(pitch);
    }
  }

  // Above staff
  for (let pos = 10; pos <= 14; pos += 2) {
    const pitch = TREBLE_CLEF_PITCHES[pos];
    if (pitch) {
      ledgerPitches.push(pitch);
    }
  }

  return ledgerPitches;
};

/**
 * Validate if a pitch is within reasonable range for the staff
 */
export const isValidPitch = (pitch: Note): boolean => {
  const linePosition = pitchToLinePosition(pitch);
  return linePosition >= -6 && linePosition <= 14;
};

/**
 * Get the staff line positions that correspond to actual staff lines (not spaces)
 */
export const getStaffLinePositions = (): number[] => {
  return [0, 2, 4, 6, 8]; // e/4, g/4, b/4, d/5, f/5
};

/**
 * Get the staff space positions (between lines)
 */
export const getStaffSpacePositions = (): number[] => {
  return [1, 3, 5, 7]; // f/4, a/4, c/5, e/5
};
