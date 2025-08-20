// Note class constants (for future enum-like usage)
export type NOTE_CLASS = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type OCTAVE = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const NOTE_CLASSES: NOTE_CLASS[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const PITCH_CLASSES = [
  { noteClass: 'C', accidental: 'natural' },
  { noteClass: 'C', accidental: 'sharp' },
  { noteClass: 'D', accidental: 'natural' },
  { noteClass: 'D', accidental: 'sharp' },
  { noteClass: 'E', accidental: 'natural' },
  { noteClass: 'F', accidental: 'natural' },
  { noteClass: 'F', accidental: 'sharp' },
  { noteClass: 'G', accidental: 'natural' },
  { noteClass: 'G', accidental: 'sharp' },
  { noteClass: 'A', accidental: 'natural' },
  { noteClass: 'A', accidental: 'sharp' },
  { noteClass: 'B', accidental: 'natural' },
] as const;
export const ACCIDENTALS = ['natural', 'sharp', 'flat'] as const;
export const ACCIDENTALS_MAP = {
  natural: {
    increment: 0,
    symbol: '♮',
    vexFlowSymbol: '',

  },
  sharp: {
    increment: 1,
    symbol: '♯',
    vexFlowSymbol: '#',
  },
  flat: {
    increment: -1,
    symbol: '♭',
    vexFlowSymbol: 'b',
  },
};
export const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const NOTE_CLASS_NUMBER_MAP = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export type CLEF = 'treble' | 'bass';
export const CLEF_POSITION_REF = {
  treble: {
    noteClass: 'E',
    octave: 4,
  },
};
