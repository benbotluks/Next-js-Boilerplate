import type { Note } from '@/types/MusicTypes';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import { Formatter, StaveNote, Voice } from 'vexflow';
import { pitchToLinePosition, pitchToVexFlowKey } from './notePositioning';

/**
 * Configuration for note rendering styles
 */
export type NoteStyle = {
  fillStyle: string;
  strokeStyle: string;
  strokeWidth?: number;
  opacity?: number;
};

/**
 * Default note styles
 */
export const NOTE_STYLES = {
  default: { fillStyle: '#000000', strokeStyle: '#000000' },
  selected: { fillStyle: '#3b82f6', strokeStyle: '#3b82f6' },
  correct: { fillStyle: '#10b981', strokeStyle: '#10b981' },
  incorrect: { fillStyle: '#ef4444', strokeStyle: '#ef4444' },
  hovered: { fillStyle: '#6b7280', strokeStyle: '#6b7280', opacity: 0.7 },
} as const;

/**
 * Create VexFlow StaveNote from our Note type
 */
export const createStaveNote = (pitch: Note, duration: string = 'q'): StaveNote => {
  const vexFlowKey = pitchToVexFlowKey(pitch);

  return new StaveNote({
    keys: [vexFlowKey],
    duration,
  });
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
  _validationResult?: AnswerValidationResult,
): NoteStyle => {
  // Hovered state takes precedence
  if (hoveredPitch === pitch) {
    return NOTE_STYLES.hovered;
  }

  // Validation result styling when showing correct answers
  if (showCorrectAnswer) {
    if (correctNotes.includes(pitch) && selectedNotes.includes(pitch)) {
      return NOTE_STYLES.correct;
    } else if (selectedNotes.includes(pitch) && !correctNotes.includes(pitch)) {
      return NOTE_STYLES.incorrect;
    }
  }

  // Selected state
  if (selectedNotes.includes(pitch)) {
    return NOTE_STYLES.selected;
  }

  return NOTE_STYLES.default;
};

/**
 * Render notes on a staff
 */
export const renderNotesOnStaff = (
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  selectedNotes: Note[],
  correctNotes: Note[] = [],
  hoveredPitch: Note | null = null,
  showCorrectAnswer: boolean = false,
  validationResult?: AnswerValidationResult,
): void => {
  if (selectedNotes.length === 0) {
    return;
  }

  try {
    // Create StaveNote objects for selected notes

    const sortedNotes = [...selectedNotes].sort((a, b) => {
      const aPos = pitchToLinePosition(a);
      const bPos = pitchToLinePosition(b);
      return aPos - bPos; // Lower line positions first
    });

    const staveNote = new StaveNote({
      keys: sortedNotes.map(note =>
        pitchToVexFlowKey(note),
      ),
      duration: 'q',
    });

    if (sortedNotes && sortedNotes[0]) {
      const style = getNoteStyle(
        sortedNotes[0],
        selectedNotes,
        correctNotes,
        hoveredPitch,
        showCorrectAnswer,
        validationResult,
      );
      staveNote.setStyle(style);
    }

    staveNote.setStave(stave);

    // Create a voice to hold the notes
    const voice = new Voice({
      numBeats: 1,
      beatValue: 4,
    });

    // Add notes to voice
    voice.addTickables([staveNote]);

    // Format the voice to fit the stave
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], stave.getWidth() - 100);

    // Draw the voice
    voice.draw(context, stave);
  } catch (error) {
    console.error('Failed to render notes:', error);
  }
};

/**
 * Render a preview note at a specific position (for hover effects)
 */
export const renderPreviewNote = (
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  pitch: Note,
  x: number,
): void => {
  try {
    const staveNote = createStaveNote(pitch);
    staveNote.setStyle(NOTE_STYLES.hovered);
    staveNote.setStave(stave);

    // Position the note at the specified x coordinate
    staveNote.setXShift(x - stave.getNoteStartX());

    // Create a temporary voice for the preview note
    const voice = new Voice({
      numBeats: 1,
      beatValue: 4,
    });

    voice.addTickables([staveNote]);

    // Format and draw
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], 100);

    voice.draw(context, stave);
  } catch (error) {
    console.error('Failed to render preview note:', error);
  }
};

/**
 * Clear the staff and redraw the base staff elements
 */
export const clearAndRedrawStaff = (
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
): void => {
  try {
    context.clear();
    stave.setContext(context);
    stave.draw();
  } catch (error) {
    console.error('Failed to clear and redraw staff:', error);
  }
};

/**
 * Calculate the optimal spacing for notes on the staff
 */
export const calculateNoteSpacing = (
  noteCount: number,
  availableWidth: number,
): number => {
  if (noteCount <= 1) {
    return availableWidth / 2;
  }

  const minSpacing = 40; // Minimum space between notes
  const maxSpacing = 80; // Maximum space between notes

  const calculatedSpacing = availableWidth / (noteCount + 1);
  return Math.max(minSpacing, Math.min(maxSpacing, calculatedSpacing));
};

/**
 * Check if two notes would overlap when rendered
 */
export const wouldNotesOverlap = (
  pitch1: Note,
  pitch2: Note,
  spacing: number,
): boolean => {
  // Simple overlap detection based on pitch proximity and spacing
  // This is a simplified version - a full implementation would consider
  // actual note head sizes and positions
  const minSpacing = 30;
  return spacing < minSpacing;
};
