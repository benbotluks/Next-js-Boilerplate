import type { NOTE_CLASS } from './MusicConstants';
import type { Octave } from '@/types/MusicTypes';
import { RuntimeError } from 'vexflow';
import { NOTE_CONFIG } from '@/config/gameConfig';
import { Note } from '@/libs/Note';
import { ACCIDENTALS, ACCIDENTALS_MAP, CLEF_POSITION_REF, NOTE_CLASS_NUMBER_MAP, NOTE_CLASSES, OCTAVES, PITCH_CLASSES } from './MusicConstants';

export const toVexFlowFormat = (note: Note): string => {
  return `${note.noteClass.toLowerCase()}${ACCIDENTALS_MAP[note.accidental].vexFlowSymbol}/${note.octave}`;
};

export const toDisplayFormat = (note: Note): string => {
  return `${note.noteClass.toUpperCase()}${ACCIDENTALS_MAP[note.accidental].vexFlowSymbol}${note.octave}`;
};

export const cycleAccidental = (note: Note): Note => {
  const { noteClass, octave } = note;

  const accidental = ACCIDENTALS[(ACCIDENTALS.indexOf(note.accidental) + 1) % ACCIDENTALS.length]!;
  return new Note({ noteClass, octave, accidental });
};

export const noteToMidiNumber = (note: Note): number => {
  const semitone = NOTE_CLASS_NUMBER_MAP[note.noteClass] + ACCIDENTALS_MAP[note.accidental].increment;

  return (note.octave + 1) * 12 + semitone;
};

export const isTooLow = (note: Note, inclusive: boolean = true): boolean => {
  // "inclusive" means whether to accept note that IS the minimum
  if (inclusive) {
    return (noteToMidiNumber(note) < NOTE_CONFIG.MIN_PITCH_MIDI);
  } else {
    return (noteToMidiNumber(note) <= NOTE_CONFIG.MIN_PITCH_MIDI);
  }
};

export const isTooHigh = (note: Note, inclusive: boolean = true): boolean => {
  // "inclusive" means whether to accept note that IS the minimum
  if (inclusive) {
    return (noteToMidiNumber(note) > NOTE_CONFIG.MAX_PITCH_MIDI);
  } else {
    return (noteToMidiNumber(note) >= NOTE_CONFIG.MAX_PITCH_MIDI);
  }
};

export const setNoteAccidental = (note: Note, accidental: 'natural' | 'sharp' | 'flat'): Note => {
  if (note.accidental === accidental) {
    throw new RuntimeError(`Accidental ${accidental} matches existing note`, Note);
    return;
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

const euclidMod = (n: number, d: number) => ((n % d) + d) % d;
const getRefIndex = (refLetter: NOTE_CLASS): number => NOTE_CLASSES.indexOf(refLetter);

export const treblePositionFromNote = (note: Note, clef: 'treble' = 'treble'): number => {
  const idx = NOTE_CLASSES.indexOf(note.noteClass);
  const { noteClass, octave } = CLEF_POSITION_REF[clef];
  return 7 * (note.octave - octave) + (idx - getRefIndex(noteClass as NOTE_CLASS));
};

/** Staff position -> { letter, octave } (treble) */
export function noteFromTreblePosition(pos: number): { letter: Letter; octave: number } {
  const abs = REF_ABS + pos; // absolute diatonic number
  const octave = Math.floor(abs / 7); // Euclidean floor works in JS
  const idx = euclidMod(abs, 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return { letter: LETTERS[idx], octave };
}
