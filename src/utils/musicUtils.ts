import type { NOTE_CLASS } from './MusicConstants';
import type { Octave } from '@/types/MusicTypes';
import { RuntimeError } from 'vexflow';
import { NOTE_CONFIG } from '@/config/gameConfig';
import { detectAccidental, getNaturalNote, getOctave } from '@/MusicTest/components/ClickableNoteInput/utils';
import { Note } from '@/types/note';
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
  return new Note(noteClass, octave, accidental);
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

/** Staff position -> VexFlow key like "a/4" (lowercase letter / octave) */
export function vexKeyFromTreblePosition(pos: number): VexKey {
  const { letter, octave } = noteFromTreblePosition(pos);
  return `${letter.toLowerCase()}/${octave}` as VexKey;
}

export const mobileUtils = {
  /**
   * Move a note up by one natural note step (C→D→E→F→G→A→B→C) and remove accidental
   */
  moveNoteUpStep: (note: Note): Note => {
    const naturalNote = getNaturalNote(note);
    const octave = getOctave(note);

    // Natural note progression (no accidentals)
    const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const currentIndex = noteOrder.indexOf(naturalNote);
    if (currentIndex === -1) {
      return note;
    }

    const nextIndex = (currentIndex + 1) % noteOrder.length;
    const nextNote = noteOrder[nextIndex]!;
    const nextOctave = nextIndex === 0 ? (Number.parseInt(octave) + 1).toString() : octave;

    return ensureVexFlowFormat(`${nextNote}${nextOctave}`);
  },

  /**
   * Move a note down by one natural note step (C→B→A→G→F→E→D→C) and remove accidental
   */
  moveNoteDownStep: (note: Note): Note => {
    const naturalNote = getNaturalNote(note);
    const octave = getOctave(note);

    // Natural note progression (no accidentals)
    const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const currentIndex = noteOrder.indexOf(naturalNote);
    if (currentIndex === -1) {
      return note;
    }

    const prevIndex = currentIndex === 0 ? noteOrder.length - 1 : currentIndex - 1;
    const prevNote = noteOrder[prevIndex]!;
    const prevOctave = currentIndex === 0 ? (Number.parseInt(octave) - 1).toString() : octave;

    return ensureVexFlowFormat(`${prevNote}${prevOctave}`);
  },

  /**
   * Move a note up by one octave
   */
  moveNoteUpOctave: (note: Note): Note => {
    const naturalNote = getNaturalNote(note);
    const octave = getOctave(note);
    const currentAccidental = detectAccidental(note);

    const newOctave = (Number.parseInt(octave) + 1).toString();
    const accidentalSymbol = currentAccidental === 'sharp' ? '#' : currentAccidental === 'flat' ? 'b' : '';

    return ensureVexFlowFormat(`${naturalNote}${accidentalSymbol}${newOctave}`);
  },

  /**
   * Move a note down by one octave
   */
  moveNoteDownOctave: (note: Note): Note => {
    const naturalNote = getNaturalNote(note);
    const octave = getOctave(note);
    const currentAccidental = detectAccidental(note);

    const newOctave = (Number.parseInt(octave) - 1).toString();
    const accidentalSymbol = currentAccidental === 'sharp' ? '#' : currentAccidental === 'flat' ? 'b' : '';

    return ensureVexFlowFormat(`${naturalNote}${accidentalSymbol}${newOctave}`);
  },

  /**
   * Change the accidental of a note
   */
  setNoteAccidental: (note: Note, accidental: 'natural' | 'sharp' | 'flat'): Note => {
    const naturalNote = getNaturalNote(note);
    const octave = getOctave(note);

    const accidentalSymbol = accidental === 'sharp' ? '#' : accidental === 'flat' ? 'b' : '';
    return ensureVexFlowFormat(`${naturalNote}${accidentalSymbol}${octave}`);
  },
};

;
