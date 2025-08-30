import type { RenderContext, Stave } from 'vexflow';
import type { Clef, Note, Staves } from '@/types/';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import style from 'styled-jsx/style';
import { Accidental, Formatter, StaveNote, Voice } from 'vexflow';
import { ACCIDENTALS_MAP } from '@/utils/MusicConstants';
import { toVexFlowFormat } from '@/utils/musicUtils';

const justifyWidth = (stave: Stave) => stave.getWidth() - 100;

export type NoteStyle = {
  fillStyle: string;
  strokeStyle: string;
  strokeWidth?: number;
  opacity?: number;
};

/**
 * Default note styles with enhanced hover and animation support
 */
export const NOTE_STYLES = {
  default: { fillStyle: '#000000', strokeStyle: '#000000', opacity: 1 },
  selected: { fillStyle: '#3b82f6', strokeStyle: '#3b82f6', opacity: 1 },
  correct: { fillStyle: '#00ff00', strokeStyle: '#00ff00', opacity: 1 }, // Bright green for debugging
  incorrect: { fillStyle: '#dc2626', strokeStyle: '#dc2626', opacity: 1 }, // Darker red for better visibility
  hovered: { fillStyle: '#6b7280', strokeStyle: '#6b7280', opacity: 0.6 },
  preview: { fillStyle: '#9ca3af', strokeStyle: '#9ca3af', opacity: 0.5 },
  fadeIn: { fillStyle: '#9ca3af', strokeStyle: '#9ca3af', opacity: 0.6 },
  fadeOut: { fillStyle: '#9ca3af', strokeStyle: '#9ca3af', opacity: 0.3 },
} as const satisfies Record<string, NoteStyle>;

export type NoteStyleKey = keyof typeof NOTE_STYLES;

export const getNoteStyles = (
  selectedNotes: Note[],
  hoveredNote: Note | null,
  animationState?: AnimationState,
  showCorrectAnswer: boolean = false,
  correctNotes?: Note[],
  validationResult?: AnswerValidationResult,
): NoteStyleKey[] => {
  const noteStyles = selectedNotes.map((note) => {
    if (animationState) {
      return animationState;
    }
    if (hoveredNote?.linePosition === note.linePosition) {
      return 'hovered';
    }
    return 'default';
  });

  return noteStyles;
};

const addAccidentalsToStaveNote = (keys: Note[], staveNote: StaveNote) => {
  keys.forEach((note, index) => {
    if (note.accidental !== 'natural') {
      staveNote.addModifier(new Accidental(ACCIDENTALS_MAP[note.accidental].vexFlowSymbol), index);
    }
  });

  return staveNote;
};

type StaveNoteProps = {
  notes: Note[];
  staves: Staves;
  clef: Clef;
  hoveredNote: Note | null;
  animationState?: AnimationState;
};
export const createStaveNote = ({ notes, staves, clef, hoveredNote, animationState }: StaveNoteProps): StaveNote => {
  const keys = notes.map(toVexFlowFormat);
  const staveNote = new StaveNote({
    keys,
    duration: 'q',
    clef,
  });

  addAccidentalsToStaveNote(notes, staveNote);
  const noteStyles = getNoteStyles(notes, hoveredNote, animationState);
  console.log(noteStyles);
  noteStyles.forEach((style, i) => staveNote.setKeyStyle(i, NOTE_STYLES[style]));

  staveNote.setStyle(style);
  staveNote.setStave(staves[clef]);

  return staveNote;
};

/**
 * Get validation state for a note
 */
export const getNoteValidationState = (
  pitch: Note,
  selectedNotes: Note[],
  correctNotes: Note[],
  validationResult?: AnswerValidationResult,
): 'correct' | 'incorrect' | 'missing' | 'neutral' => {
  const isSelected = selectedNotes.includes(pitch);
  const isCorrect = correctNotes.includes(pitch);

  if (!validationResult) {
    return 'neutral';
  }

  if (isSelected && isCorrect) {
    return 'correct';
  } else if (isSelected && !isCorrect) {
    return 'incorrect';
  } else if (!isSelected && isCorrect) {
    return 'missing';
  }

  return 'neutral';
};

type NoteMap = { clef: Clef; notes: Note[] };

type AnimationState = 'fadeIn' | 'fadeOut' | null;
export const createAndRenderStaveNotes = (
  staves: Staves, // VexFlow Stave
  context: RenderContext, // VexFlow RenderContext
  noteMaps: NoteMap[],
  hoveredNote: Note | null = null,
  animationState?: AnimationState,
) => {
  const staveNotes = noteMaps.map(noteMap => createStaveNote({ ...noteMap, staves, hoveredNote, animationState }));
  console.log(staveNotes);
  const voices = staveNotes.map((staveNote) => {
    const voice = new Voice({
      numBeats: 1,
      beatValue: 4,
    });
    voice.addTickables([staveNote]);
    return voice;
  });

  // Format and draw
  const formatter = new Formatter();
  formatter.joinVoices(voices);
  formatter.format(voices, justifyWidth(staves.treble));

  voices.forEach((voice, i) => voice.draw(context, staves[noteMaps[i]?.clef as Clef]));
};

export const renderNoteGroup = (
  staves: Staves,
  context: RenderContext, // VexFlow RenderContext
  selectedNotes: Note[],
  hoveredNote: Note | null = null,
): void => {
  if (selectedNotes[0]) {
    const trebleNotes = selectedNotes.filter(n => n.octave >= 4);
    const bassNotes = selectedNotes.filter(n => n.octave < 4);

    const notesMap: NoteMap[] = [];
    if (trebleNotes.length) {
      notesMap.push({ clef: 'treble', notes: trebleNotes });
    }
    if (bassNotes.length) {
      notesMap.push({ clef: 'bass', notes: bassNotes });
    }

    createAndRenderStaveNotes(staves, context, notesMap, hoveredNote);
  }
};

export const renderNoteGroups = (
  staves: Staves,
  context: RenderContext,
  selectedNotes: Note[],
  correctNotes: Note[],
): void => {
  try {
    const selectedStaveNote = createStaveNote(selectedNotes, NOTE_STYLES.selected, stave);
    const correctStaveNote = createStaveNote(correctNotes, NOTE_STYLES.correct, stave);

    // Create a voice to hold the notes
    const voice = new Voice({
      numBeats: 2,
      beatValue: 4,
    });

    voice.addTickables([selectedStaveNote, correctStaveNote]);

    // Format the voice to fit the stave
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], stave.getWidth() - 48);

    // Draw the voice
    voice.draw(context, stave);
  } catch (error) {
    console.error('Failed to render side-by-side note group:', error);
  }
};

/**
 * Render notes on a staff with validation support
 */
export const renderNotesOnStaff = (
  staves: Staves,
  context: RenderContext, // VexFlow RenderContext
  selectedNotes: Note[],
  correctNotes: Note[] = [],
  hoveredNote: Note | null = null,
  showCorrectAnswer: boolean = false,
  validationResult?: AnswerValidationResult,
): void => {
  try {
    if (showCorrectAnswer && validationResult) {
      renderNoteGroups(staves, context, selectedNotes, correctNotes);
    } else {
      // Normal rendering - just render the selected notes as a chord
      if (selectedNotes.length > 0) {
        renderNoteGroup(
          staves,
          context,
          selectedNotes,
          hoveredNote,
        );
      }
    }
  } catch (error) {
    console.error('Failed to render notes:', error);
  }
};

export const renderPreviewNote = (
  staves: Staves, // VexFlow Stave
  context: RenderContext, // VexFlow RenderContext
  note: Note,
  animationState?: AnimationState,
): void => {
  const clef: Clef = note.octave < 4 ? 'bass' : 'treble';
  createAndRenderStaveNotes(staves, context, [{ clef, notes: [note] }], undefined, animationState);
};

export const clearAndRedrawStaff = (
  staves: Staves, // VexFlow Stave
  context: RenderContext, // VexFlow RenderContext
): void => {
  context.clear();
  Object.values(staves).forEach((stave) => {
    stave.setContext(context);
    stave.draw();
  });
};
