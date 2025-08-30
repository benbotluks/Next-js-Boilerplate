import type { RenderContext, Stave } from 'vexflow';
import type { Clef, Note, Staves } from '@/types/';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
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
  previewFadeIn: { fillStyle: '#9ca3af', strokeStyle: '#9ca3af', opacity: 0.6 },
  previewFadeOut: { fillStyle: '#9ca3af', strokeStyle: '#9ca3af', opacity: 0.3 },
} as const satisfies Record<string, NoteStyle>;

export type NoteStyleKey = keyof typeof NOTE_STYLES;

const addAccidentalsToStaveNote = (keys: Note[], staveNote: StaveNote) => {
  keys.forEach((note, index) => {
    if (note.accidental !== 'natural') {
      staveNote.addModifier(new Accidental(ACCIDENTALS_MAP[note.accidental].vexFlowSymbol), index);
    }
  });

  return staveNote;
};

/**
 * Create VexFlow StaveNote from our Note type with accidentals
 */
export const createStaveNote = (notes: Note | Note[], style: NoteStyle, stave: Stave | Staves, clef: Clef, duration: string = 'q'): StaveNote => {
  notes = Array.isArray(notes) ? notes : [notes];

  const keys = notes.map(toVexFlowFormat);

  const staveNote = new StaveNote({
    keys,
    duration,
    clef,
  });

  addAccidentalsToStaveNote(notes, staveNote);

  staveNote.setStyle(style);

  if ('treble' in stave && 'bass' in stave) {
    stave = stave[clef];
  }
  staveNote.setStave(stave);

  return staveNote;
};

export const createSplitStaveNote = () => {

};

/**
 * Get the appropriate style for a note based on its state
 */
export const getNoteStyle = (
  pitch: Note,
  selectedNotes: Note[],
  correctNotes: Note[],
  hoveredPitch: Note | null,
  showCorrectAnswer: boolean,
  validationResult?: AnswerValidationResult,
): NoteStyle => {
  // Hovered state takes precedence
  if (hoveredPitch === pitch) {
    return NOTE_STYLES.hovered;
  }

  // Validation result styling when showing correct answers or after validation
  if (showCorrectAnswer || validationResult) {
    const isSelected = selectedNotes.includes(pitch);
    const isCorrect = correctNotes.includes(pitch);

    if (isSelected && isCorrect) {
      return NOTE_STYLES.correct;
    } else if (isSelected && !isCorrect) {
      return NOTE_STYLES.incorrect;
    } else if (!isSelected && isCorrect && showCorrectAnswer) {
      // Show correct answers that weren't selected (with reduced opacity)
      return { ...NOTE_STYLES.correct, opacity: 0.4 };
    }
  }

  // Selected state
  if (selectedNotes.includes(pitch)) {
    return NOTE_STYLES.selected;
  }

  return NOTE_STYLES.default;
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

export const renderNoteGroup = (
  staves: Staves,
  context: RenderContext, // VexFlow RenderContext
  notesToRender: Note[],
  selectedNotes: Note[],
  correctNotes: Note[],
  hoveredPitch: Note | null,
  showCorrectAnswer: boolean,
  validationResult?: AnswerValidationResult,
): void => {
  if (notesToRender.length === 0) {
    return;
  }

  if (selectedNotes[0]) {
    const style = getNoteStyle(
      selectedNotes[0],
      selectedNotes,
      correctNotes,
      hoveredPitch,
      showCorrectAnswer,
      validationResult,
    );

    const trebleNotes = selectedNotes.filter(n => n.octave >= 4);
    const bassNotes = selectedNotes.filter(n => n.octave < 4);

    const voices = [];

    if (bassNotes.length > 0) {
      const bassStaveNote = createStaveNote(bassNotes, style, staves, 'bass');
      bassStaveNote.setStyle(style);
      bassStaveNote.setStave(staves.bass);

      // Create a voice to hold the notes
      const bassVoice = new Voice({
        numBeats: 1,
        beatValue: 4,
      });

      bassVoice.addTickables([bassStaveNote]);
      voices.push({ clef: 'bass', voice: bassVoice });
    }

    if (trebleNotes.length > 0) {
      const trebleStaveNote = createStaveNote(trebleNotes, style, staves, 'treble');
      trebleStaveNote.setStyle(style);
      trebleStaveNote.setStave(staves.treble);

      const trebleVoice = new Voice({
        numBeats: 1,
        beatValue: 4,
      });

      trebleVoice.addTickables([trebleStaveNote]);
      voices.push({ clef: 'treble', voice: trebleVoice });
    }
    // Format the voice to fit the stave
    const formatter = new Formatter();
    const vexVoices = voices.map(v => v.voice);

    formatter.joinVoices(vexVoices);
    formatter.format(vexVoices, justifyWidth(staves.treble));

    voices.forEach(v => v.voice.draw(context, staves[v.clef as keyof Staves]));
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
  hoveredPitch: Note | null = null,
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
          selectedNotes,
          correctNotes,
          hoveredPitch,
          showCorrectAnswer,
          validationResult,
        );
      }
    }
  } catch (error) {
    console.error('Failed to render notes:', error);
  }
};

/**
 * Render a group of notes with consistent styling
 */

/**
 * Render a preview note at a specific position (for hover effects)
 */

export const renderPreviewNote = (
  staves: Staves, // VexFlow Stave
  context: RenderContext, // VexFlow RenderContext
  pitch: Note,
  animationState?: 'fadeIn' | 'fadeOut' | null,
): void => {
  try {
    // Choose style based on animation state
    let style: NoteStyle = NOTE_STYLES.preview;
    if (animationState === 'fadeIn') {
      style = NOTE_STYLES.previewFadeIn;
    } else if (animationState === 'fadeOut') {
      style = NOTE_STYLES.previewFadeOut;
    }

    const clef = pitch.octave < 4 ? 'bass' : 'treble';
    const stave = staves[clef];
    const staveNote = createStaveNote(pitch, style, stave, clef);

    staveNote.setStyle(style);
    staveNote.setStave(stave);

    // Create a temporary voice for the preview note
    const voice = new Voice({
      numBeats: 1,
      beatValue: 4,
    });

    voice.addTickables([staveNote]);

    // Format and draw
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], justifyWidth(stave));

    voice.draw(context, stave);
  } catch (error) {
    console.error('Failed to render preview note:', error);
  }
};

export const renderPreviewGuidelines = (
  context: RenderContext, // VexFlow RenderContext
  stave: any, // VexFlow Stave
  x: number,
): void => {
  try {
    const originalStrokeStyle = context.strokeStyle;
    const originalLineWidth = context.lineWidth;
    const originalGlobalAlpha = context.globalAlpha;

    // Set guideline style
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1;
    context.globalAlpha = 0.5;

    // Draw vertical guideline
    context.beginPath();
    context.moveTo(x, stave.getYForTopText() - 10);
    context.lineTo(x, stave.getBottomLineY() + 10);
    context.stroke();

    // Restore original context settings
    context.strokeStyle = originalStrokeStyle;
    context.lineWidth = originalLineWidth;
    context.globalAlpha = originalGlobalAlpha;
  } catch (error) {
    console.error('Failed to render preview guidelines:', error);
  }
};

/**
 * Render preview note with enhanced visual feedback
 */
export const renderEnhancedPreviewNote = (
  staves: Staves, // VexFlow Stave
  context: RenderContext, // VexFlow RenderContext
  pitch: Note,
  x: number,
  animationState?: 'fadeIn' | 'fadeOut' | null,
  showGuidelines: boolean = false,
): void => {
  try {
    // Render guidelines if enabled
    if (showGuidelines) {
      renderPreviewGuidelines(context, stave, x);
    }

    // Render the preview note
    renderPreviewNote(staves, context, pitch, animationState);
  } catch (error) {
    console.error('Failed to render enhanced preview note:', error);
  }
};

/**
 * Clear the staff and redraw the base staff elements
 */
export const clearAndRedrawStaff = (
  system: any, // VexFlow Stave
  context: RenderContext, // VexFlow RenderContext
): void => {
  try {
    const { treble, bass } = system;
    context.clear();
    treble.setContext(context);
    bass.setContext(context);
    treble.draw();
    bass.draw();
  } catch (error) {
    console.error('Failed to clear and redraw staff:', error);
  }
};
