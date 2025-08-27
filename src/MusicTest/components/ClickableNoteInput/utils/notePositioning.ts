import type { Note } from '@/types/note';
import { toVexFlowFormat } from '@/utils/musicUtils';

const TREBLE_CLEF_PITCHES: Record<number, Note> = {

  '-4': { noteClass: 'A', octave: 3, accidental: 'natural' },
  '-3': { noteClass: 'B', octave: 3, accidental: 'natural' },
  '-2': { noteClass: 'C', octave: 4, accidental: 'natural' },
  '-1': { noteClass: 'D', octave: 4, accidental: 'natural' },
  '0': { noteClass: 'E', octave: 4, accidental: 'natural' },
  '1': { noteClass: 'F', octave: 4, accidental: 'natural' },
  '2': { noteClass: 'G', octave: 4, accidental: 'natural' },
  '3': { noteClass: 'A', octave: 4, accidental: 'natural' },
  '4': { noteClass: 'B', octave: 4, accidental: 'natural' },
  '5': { noteClass: 'C', octave: 5, accidental: 'natural' },
  '6': { noteClass: 'D', octave: 5, accidental: 'natural' },
  '7': { noteClass: 'E', octave: 5, accidental: 'natural' },
  '8': { noteClass: 'F', octave: 5, accidental: 'natural' },
  '9': { noteClass: 'G', octave: 5, accidental: 'natural' },
  '10': { noteClass: 'A', octave: 5, accidental: 'natural' },
  '11': { noteClass: 'B', octave: 5, accidental: 'natural' },
  '12': { noteClass: 'C', octave: 6, accidental: 'natural' },
} as const;

/**
 * Reverse mapping from pitch to line position
 */
const PITCH_TO_LINE_POSITION: Partial<Record<string, number>> = {};

// Initialize the mapping lazily to avoid circular dependency issues
const initializePitchToLinePosition = () => {
  if (Object.keys(PITCH_TO_LINE_POSITION).length === 0) {
    Object.entries(TREBLE_CLEF_PITCHES).forEach(([linePos, note]) => {
      PITCH_TO_LINE_POSITION[toVexFlowFormat(note)] = Number.parseInt(linePos);
    });
  }
};

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
  // if (basePositions.length === 0 || !basePositions[0]) {
  //   return 'c/4'; // Fallback
  // }

  let closestPos = basePositions[0];
  let minDistance = Math.abs(linePosition - closestPos!);

  for (const pos of basePositions) {
    const distance = Math.abs(linePosition - pos);
    if (distance < minDistance) {
      minDistance = distance;
      closestPos = pos;
    }
  }

  return TREBLE_CLEF_PITCHES[closestPos!];
};
