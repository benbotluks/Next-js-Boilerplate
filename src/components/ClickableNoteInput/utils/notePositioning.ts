import type { Note } from '@/types/MusicTypes';

/**
 * Utility functions for note positioning and pitch calculations
 */

/**
 * Treble clef pitch mapping for staff positions
 * Line positions: 0 = E4 (bottom line), 2 = G4, 4 = B4, 6 = D5, 8 = F5 (top line)
 * Space positions: 1 = F4, 3 = A4, 5 = C5, 7 = E5
 * We avoid duplicate pitches by using different octaves for ledger lines
 */
const TREBLE_CLEF_PITCHES: Record<number, Note> = {
  // Below staff (ledger lines)
  '-6': 'C4',
  '-4': 'D4',

  // On staff
  '0': 'E4', // Bottom line
  '1': 'F4', // First space
  '2': 'G4', // Second line
  '3': 'A4', // Second space
  '4': 'B4', // Middle line
  '5': 'C5', // Third space
  '6': 'D5', // Fourth line
  '7': 'E5', // Fourth space
  '8': 'F5', // Top line

  // Above staff (ledger lines)
  '10': 'G5',
  '12': 'A5',
  '14': 'B5',
};

/**
 * Reverse mapping from pitch to line position
 */
const PITCH_TO_LINE_POSITION: Record<Note, number> = {};
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
  let closestPos = basePositions[0];
  let minDistance = Math.abs(linePosition - closestPos);

  for (const pos of basePositions) {
    const distance = Math.abs(linePosition - pos);
    if (distance < minDistance) {
      minDistance = distance;
      closestPos = pos;
    }
  }

  return TREBLE_CLEF_PITCHES[closestPos];
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
  if (!match) {
    return 4; // Default to middle line (B4)
  }

  const [, noteName, accidental, octave] = match;
  const octaveNum = Number.parseInt(octave);

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
 * Get the note name without octave and accidental
 */
export const getNoteName = (pitch: Note): string => {
  const match = pitch.match(/^([A-G])/);
  return match ? match[1] : 'C';
};

/**
 * Get the octave number from a pitch
 */
export const getOctave = (pitch: Note): number => {
  const match = pitch.match(/(\d)$/);
  return match ? Number.parseInt(match[1]) : 4;
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
  return [0, 2, 4, 6, 8]; // E4, G4, B4, D5, F5
};

/**
 * Get the staff space positions (between lines)
 */
export const getStaffSpacePositions = (): number[] => {
  return [1, 3, 5, 7]; // F4, A4, C5, E5
};
