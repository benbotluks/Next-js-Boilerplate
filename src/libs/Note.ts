import type { Accidental, NoteClass, Octave } from '@/MusicTest/types/MusicTypes';
import type { NOTE_CLASS } from '@/utils/MusicConstants';
import { nanoid } from 'nanoid';
import { NOTE_CLASSES } from '@/utils/MusicConstants';
import { isTooHigh, isTooLow } from '@/utils/musicUtils';

type NoteProps = {
  noteClass: NoteClass;
  octave: Octave;
  linePosition?: number;
  accidental?: Accidental;
};

const LINE_OFFSET = {
  note: 'C' as NOTE_CLASS,
  octave: 4,
};

export class Note {
  public readonly id = nanoid();
  public readonly noteClass: NoteClass;
  public readonly octave: Octave;
  public readonly accidental: Accidental;
  public readonly linePosition?: number;

  constructor({ noteClass, octave, accidental = 'natural', linePosition }: NoteProps) {
    this.noteClass = noteClass;
    this.octave = octave;
    this.accidental = accidental; // always defined now
    this.id = nanoid();
    this.linePosition = linePosition || this.computeLinePosition;
  }

  get computeLinePosition(): number {
    const octave_diff = this.octave - LINE_OFFSET.octave;
    return (7 * octave_diff) + (NOTE_CLASSES.indexOf(this.noteClass) - NOTE_CLASSES.indexOf(LINE_OFFSET.note));
  }

  // Computed properties
  get displayFormat(): string {
    const accidentalSymbol = this.accidental === 'natural'
      ? ''
      : this.accidental === 'sharp'
        ? '#'
        : 'b';
    return `${this.noteClass}${accidentalSymbol}${this.octave}`;
  }

  get vexFlowFormat(): string {
    return this.displayFormat;
  }

  // Immutable update methods
  withOctave(newOctave: Octave): Note {
    return new Note({ noteClass: this.noteClass, octave: newOctave, accidental: this.accidental, linePosition: this.linePosition });
  }

  withAccidental(newAccidental: Accidental): Note {
    return new Note({ noteClass: this.noteClass, octave: this.octave, accidental: newAccidental, linePosition: this.linePosition });
  }

  withNoteClass(newNoteClass: NoteClass): Note {
    return new Note({ noteClass: newNoteClass, octave: this.octave, accidental: this.accidental, linePosition: this.linePosition });
  }

  // Utility methods
  equals(other: Note): boolean {
    return this.id === other.id;
  }

  samePitch(other: Note): boolean {
    return this.noteClass === other.noteClass
      && this.octave === other.octave
      && this.accidental === other.accidental;
  }

  // For backward compatibility during migration
  toString(): string {
    return this.displayFormat;
  }

  moveStep(offset: number): Note | boolean {
    const note_classes_len = NOTE_CLASSES.length;
    const boundary_fn = offset >= 0 ? isTooHigh : isTooLow;

    const currentIndex = NOTE_CLASSES.indexOf(this.noteClass);
    const total = currentIndex + offset;

    const newIndex = ((total % note_classes_len) + note_classes_len) % note_classes_len;
    const octaveShift = Math.floor(total / note_classes_len);

    const newNote = new Note({
      noteClass: NOTE_CLASSES[newIndex] as NoteClass,
      octave: this.octave + octaveShift as Octave,
      accidental: this.accidental,
    });

    const isOutOfBounds = boundary_fn(newNote, true);
    if (isOutOfBounds) {
      return false;
    }
    return newNote;
  }

  moveOctave(distance: number): Note | boolean {
    const boundary_fn = distance >= 0 ? isTooHigh : isTooLow;
    const newNote = new Note({
      noteClass: this.noteClass,
      octave: this.octave + distance as Octave,
      accidental: this.accidental,
    });
    const isOutOfBounds = boundary_fn(newNote, true);
    if (isOutOfBounds) {
      return false;
    }
    return newNote;
  }
}
