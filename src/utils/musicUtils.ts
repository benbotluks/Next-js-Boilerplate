import type { Note } from '@/types/MusicTypes';

export const convertToVexFlowFormat = (note: Note): Note => {
  // Convert 'G4' to 'g/4'
  const match = note.match(/^([A-G][#b]?)(\d)$/);
  if (match) {
    const [, noteName, octave] = match;
    return `${noteName!.toLowerCase()}/${octave}` as Note;
  }
  return note;
};

export const convertFromVexFlowFormat = (note: Note): Note => {
  // Convert 'g/4' to 'G4'
  const match = note.match(/^([a-g][#b]?)\/(\d)$/);
  if (match) {
    const [, noteName, octave] = match;
    return `${noteName!.toUpperCase()}${octave}` as Note;
  }
  return note;
};

/**
 * Get the natural note name without accidental
 */
export const getNaturalNote = (note: Note): string => {
  // Handle VexFlow format (c#/4)
  const vexFlowMatch = note.match(/^([a-g])[#b]?\/(\d)$/);
  if (vexFlowMatch) {
    return vexFlowMatch[1]!.toUpperCase();
  }

  // Handle standard format (C#4)
  const standardMatch = note.match(/^([A-G])[#b]?(\d)$/);
  return standardMatch ? standardMatch[1]! : note.charAt(0).toUpperCase();
};

/**
 * Get the octave from a note
 */
export const getOctave = (note: Note): string => {
  // Handle VexFlow format (c#/4)
  const vexFlowMatch = note.match(/^[a-g][#b]?\/(\d)$/);
  if (vexFlowMatch) {
    return vexFlowMatch[1]!;
  }

  // Handle standard format (C#4)
  const standardMatch = note.match(/^[A-G][#b]?(\d)$/);
  return standardMatch ? standardMatch[1]! : '4';
};

/**
 * Detect the accidental type of a note
 */
export const detectAccidental = (note: Note): 'natural' | 'sharp' | 'flat' => {
  // Handle VexFlow format (e.g., 'bb/4' = B-flat, 'b/4' = B-natural)
  const vexFlowMatch = note.match(/^([a-g])([#b]?)\/(\d)$/);
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
  const standardMatch = note.match(/^([A-G])([#b]?)(\d)$/);
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

const isVexFlowFormat = (note: Note): boolean => {
  return note.includes('/');
};

/**
 * Convert note to VexFlow format if it isn't already
 */
const ensureVexFlowFormat = (note: string): Note => {
  if (note.includes('/')) {
    return note as Note; // Already in VexFlow format
  }

  // Convert from 'C#4' to 'c#/4'
  const match = note.match(/^([A-G])([#b]?)(\d)$/);
  if (match) {
    const [, noteName, accidental, octave] = match;
    return `${noteName!.toLowerCase()}${accidental || ''}/${octave}` as Note;
  }
  return note as Note;
};

/**
 * Cycle through accidental variations of a note
 * Natural → Sharp → Flat → Natural
 */
export const cycleAccidental = (note: Note): Note => {
  const naturalNote = getNaturalNote(note);
  const octave = getOctave(note);
  const currentAccidental = detectAccidental(note);
  const useVexFlowFormat = isVexFlowFormat(note);

  // Allow all notes to cycle through natural → sharp → flat → natural

  let nextNote: string;
  switch (currentAccidental) {
    case 'natural':
      nextNote = useVexFlowFormat ? `${naturalNote.toLowerCase()}#/${octave}` : `${naturalNote}#${octave}`;
      break;
    case 'sharp':
      nextNote = useVexFlowFormat ? `${naturalNote.toLowerCase()}b/${octave}` : `${naturalNote}b${octave}`;
      break;
    case 'flat':
      nextNote = useVexFlowFormat ? `${naturalNote.toLowerCase()}/${octave}` : `${naturalNote}${octave}`;
      break;
    default:
      return note;
  }

  return ensureVexFlowFormat(nextNote);
};

/**
 * Get all possible accidental variations of a note
 */
export const getAccidentalVariations = (note: Note): Note[] => {
  const naturalNote = getNaturalNote(note);
  const octave = getOctave(note);
  const useVexFlowFormat = isVexFlowFormat(note);

  // All notes can have natural, sharp, and flat variations
  // Let users have full enharmonic freedom!
  const variations = [
    useVexFlowFormat ? `${naturalNote.toLowerCase()}/${octave}` : `${naturalNote}${octave}`,
    useVexFlowFormat ? `${naturalNote.toLowerCase()}#/${octave}` : `${naturalNote}#${octave}`,
    useVexFlowFormat ? `${naturalNote.toLowerCase()}b/${octave}` : `${naturalNote}b${octave}`,
  ];

  return variations.map(ensureVexFlowFormat);
};
