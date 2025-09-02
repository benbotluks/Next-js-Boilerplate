import type { Octave } from '@/MusicTest/types/MusicTypes';
import { RuntimeError } from 'vexflow';
import { NOTE_CONFIG } from '@/config/gameConfig';
import { Note } from '@/libs/Note';
import { ACCIDENTALS_MAP, OCTAVES, PITCH_CLASSES } from './MusicConstants';

export const toVexFlowFormat = (note: Note): string => {
  return `${note.noteClass.toLowerCase()}${ACCIDENTALS_MAP[note.accidental as keyof typeof ACCIDENTALS_MAP].vexFlowSymbol}/${note.octave}`;
};

export const isTooLow = (note: Note, inclusive: boolean = true): boolean => {
  // "inclusive" means whether to accept note that IS the minimum
  if (inclusive) {
    return (note.midiNumber < NOTE_CONFIG.MIN_PITCH_MIDI);
  } else {
    return (note.midiNumber <= NOTE_CONFIG.MIN_PITCH_MIDI);
  }
};

export const isTooHigh = (note: Note, inclusive: boolean = true): boolean => {
  // "inclusive" means whether to accept note that IS the minimum
  if (inclusive) {
    return (note.midiNumber > NOTE_CONFIG.MAX_PITCH_MIDI);
  } else {
    return (note.midiNumber >= NOTE_CONFIG.MAX_PITCH_MIDI);
  }
};

export const setNoteAccidental = (note: Note, accidental: 'natural' | 'sharp' | 'flat'): Note => {
  if (note.accidental === accidental) {
    throw new RuntimeError(`Accidental ${accidental} matches existing note`);
  }
  return new Note({ noteClass: note.noteClass, octave: note.octave, linePosition: note.linePosition, accidental });
};

export const midiNumberToNote = (midiNumber: number): Note => {
  const { noteClass, accidental } = PITCH_CLASSES[midiNumber % 12]!;
  const calculatedOctave = Math.floor(midiNumber / 12) - 1;

  if (!OCTAVES.includes(calculatedOctave as Octave)) {
    throw new RuntimeError('Octave not within specified range!', JSON.stringify({ midiNumber, noteClass, accidental, octave: calculatedOctave }));
  }

  const octave = calculatedOctave as Octave;
  return new Note({ noteClass, octave, accidental });
};
