import type { Accidental, NoteClass, Octave } from './MusicTypes';
import { nanoid } from 'nanoid';

type NoteProps = {
  noteClass: NoteClass;
  octave: Octave;
  linePosition: number;
  accidental?: Accidental;
};

export class Note {
  public readonly id = nanoid();
  public readonly noteClass: NoteClass;
  public readonly octave: Octave;
  public readonly linePosition: number;
  public readonly accidental: Accidental;

  constructor({ noteClass, octave, linePosition = -1, accidental = 'natural' }: NoteProps) {
    this.noteClass = noteClass;
    this.octave = octave;
    this.linePosition = linePosition;
    this.accidental = accidental; // always defined now
    this.id = nanoid();
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

  // Static factory methods
  // static fromString(noteString: string): Note {
  //   // Parse "C4", "F#5", "Bb3" etc.
  //   const match = noteString.match(/^([A-G])([#b]?)(\d+)$/);
  //   if (!match) {
  //     throw new Error(`Invalid note format: ${noteString}`);
  //   }

  //   const noteClass = match[1] as NoteClass;
  //   const octave = Number.parseInt(match[3]!) as Octave;
  //   let accidental: Accidental = 'natural';

  //   if (match[2] === '#') {
  //     accidental = 'sharp';
  //   } else if (match[2] === 'b') {
  //     accidental = 'flat';
  //   }

  //   return new Note(noteClass, octave, accidental);
  // }
}
