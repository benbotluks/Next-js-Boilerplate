import type { Note } from '@/types/MusicTypes';
import { convertFromVexFlowFormat } from '@/utils/musicUtils';

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
  // First try direct lookup
  const linePosition = PITCH_TO_LINE_POSITION[pitch];
  if (linePosition !== undefined) {
    return linePosition;
  }

  // Handle accidental notes by finding the natural note's position
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (match) {
    const [, noteName, , octave] = match;
    // Create the natural note equivalent and look it up
    const naturalNote = `${noteName!.toLowerCase()}/${octave}` as Note;
    const naturalPosition = PITCH_TO_LINE_POSITION[naturalNote];
    if (naturalPosition !== undefined) {
      return naturalPosition;
    }
  }

  // Handle VexFlow format
  const vexFlowMatch = pitch.match(/^([a-g])(#|b)?\/(\d)$/);
  if (vexFlowMatch) {
    const [, noteName, , octave] = vexFlowMatch;
    // Create the natural note equivalent and look it up
    const naturalNote = `${noteName}/${octave}` as Note;
    const naturalPosition = PITCH_TO_LINE_POSITION[naturalNote];
    if (naturalPosition !== undefined) {
      return naturalPosition;
    }
  }

  // Fallback estimation
  const octaveMatch = pitch.match(/(\d)$/);
  if (octaveMatch) {
    const octaveNum = Number.parseInt(octaveMatch[1]!);
    if (octaveNum < 4) {
      return 0; // Below staff
    } else if (octaveNum > 5) {
      return 8; // Above staff
    } else {
      return 4; // Middle area
    }
  }

  return 4; // Default to middle line (b/4)
};

/**
 * Detect if a pitch needs an accidental
 */
export const detectAccidental = (pitch: Note): 'sharp' | 'flat' | 'natural' | undefined => {
  // Handle VexFlow format (e.g., 'bb/4' = B-flat, 'b/4' = B-natural)
  const vexFlowMatch = pitch.match(/^([a-g])([#b]?)\/(\d)$/);
  if (vexFlowMatch) {
    const [, , accidental] = vexFlowMatch;
    if (accidental === '#') {
      return 'sharp';
    }
    if (accidental === 'b') {
      return 'flat';
    }
    return 'natural';
  }

  // Handle standard format (e.g., 'Bb4' = B-flat, 'B4' = B-natural)
  const standardMatch = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (standardMatch) {
    const [, , accidental] = standardMatch;
    if (accidental === '#') {
      return 'sharp';
    }
    if (accidental === 'b') {
      return 'flat';
    }
    return 'natural';
  }

  return 'natural';
};

/**
 * Get all possible notes for a given staff position (natural, sharp, flat)
 */
export const getNotesForStaffPosition = (linePosition: number): Note[] => {
  const naturalNote = TREBLE_CLEF_PITCHES[linePosition];
  if (!naturalNote) {
    return [];
  }

  const notes: Note[] = [naturalNote];

  // Extract note name and octave
  const match = naturalNote.match(/^([a-g])\/(\d)$/);
  if (!match) {
    return notes;
  }

  const [, noteName, octave] = match;
  const noteNameUpper = noteName!.toUpperCase();

  // Add sharp and flat versions for all notes
  // Users should have full enharmonic freedom!
  notes.push(`${noteNameUpper}#${octave}` as Note);
  notes.push(`${noteNameUpper}b${octave}` as Note);

  return notes;
};

/**
 * Get the natural note for a given chromatic note
 */
export const getNaturalNote = (note: Note): Note => {
  const match = note.match(/^([A-G])[#b]?(\d)$/);
  if (match) {
    const [, noteName, octave] = match;
    return `${noteName!.toLowerCase()}/${octave}` as Note;
  }
  return note;
};

/**
 * Cycle through accidentals for a staff position: natural → sharp → flat → natural
 */
export const cycleAccidental = (currentNote: Note): Note => {
  const linePosition = pitchToLinePosition(currentNote);
  const availableNotes = getNotesForStaffPosition(linePosition);

  if (availableNotes.length <= 1) {
    return currentNote;
  }

  const currentIndex = availableNotes.findIndex(note =>
    convertFromVexFlowFormat(note) === convertFromVexFlowFormat(currentNote),
  );

  if (currentIndex === -1) {
    return currentNote;
  }

  const nextIndex = (currentIndex + 1) % availableNotes.length;
  return availableNotes[nextIndex]!;
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
