import type { Note } from '@/types/MusicTypes';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import { Accidental, Formatter, StaveNote, Voice } from 'vexflow';
import { pitchToLinePosition } from './notePositioning';

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

/**
 * Convert note to VexFlow format with accidentals
 */
const convertNoteToVexFlowFormat = (note: Note): string => {
  // Convert from 'C#4' format to 'c#/4' format for VexFlow
  const match = note.match(/^([A-G])([#b]?)(\d)$/);
  if (match) {
    const [, noteName, accidental, octave] = match;
    return `${noteName!.toLowerCase()}${accidental || ''}/${octave}`;
  }
  return note.toLowerCase();
};

/**
 * Create VexFlow StaveNote from our Note type with accidentals
 */
export const createStaveNote = (pitch: Note | Note[], duration: string = 'q'): StaveNote => {
  const pitches = Array.isArray(pitch) ? pitch : [pitch];
  const keys = pitches.map(convertNoteToVexFlowFormat);

  const staveNote = new StaveNote({
    keys,
    duration,
  });

  // Add accidentals for each note that needs them
  pitches.forEach((note, index) => {
    // Parse the note properly to detect actual accidentals
    // Handle VexFlow format (e.g., 'bb/4' = B-flat, 'b/4' = B-natural)
    const vexFlowMatch = note.match(/^([a-g])([#b]?)\/(\d)$/);
    if (vexFlowMatch) {
      const [, , accidental] = vexFlowMatch;
      if (accidental === '#') {
        try {
          staveNote.addModifier(new Accidental('#'), index);
        } catch (error) {
          console.warn('Failed to add sharp accidental:', error);
        }
      } else if (accidental === 'b') {
        try {
          staveNote.addModifier(new Accidental('b'), index);
        } catch (error) {
          console.warn('Failed to add flat accidental:', error);
        }
      }
      return;
    }

    // Handle standard format (e.g., 'Bb4' = B-flat, 'B4' = B-natural)
    const standardMatch = note.match(/^([A-G])([#b]?)(\d)$/);
    if (standardMatch) {
      const [, , accidental] = standardMatch;
      if (accidental === '#') {
        try {
          staveNote.addModifier(new Accidental('#'), index);
        } catch (error) {
          console.warn('Failed to add sharp accidental:', error);
        }
      } else if (accidental === 'b') {
        try {
          staveNote.addModifier(new Accidental('b'), index);
        } catch (error) {
          console.warn('Failed to add flat accidental:', error);
        }
      }
    }
  });

  return staveNote;
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
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  notesToRender: Note[],
  selectedNotes: Note[],
  correctNotes: Note[],
  hoveredPitch: Note | null,
  showCorrectAnswer: boolean,
  validationResult?: AnswerValidationResult,
  isMissingNote: boolean = false,
): void => {
  if (notesToRender.length === 0) {
    return;
  }

  try {
    const sortedNotes = [...notesToRender].sort((a, b) => {
      const aPos = pitchToLinePosition(a);
      const bPos = pitchToLinePosition(b);
      return aPos - bPos; // Lower line positions first
    });

    const staveNote = createStaveNote(sortedNotes);

    // Apply styling based on the first note (they should all have similar validation state)
    if (sortedNotes[0]) {
      let style = getNoteStyle(
        sortedNotes[0],
        selectedNotes,
        correctNotes,
        hoveredPitch,
        showCorrectAnswer,
        validationResult,
      );

      // Override style for missing notes
      if (isMissingNote) {
        style = { ...NOTE_STYLES.correct, opacity: 0.4 };
      }

      staveNote.setStyle(style);
    }

    staveNote.setStave(stave);

    // Create a voice to hold the notes
    const voice = new Voice({
      numBeats: 1,
      beatValue: 4,
    });

    voice.addTickables([staveNote]);

    // Format the voice to fit the stave
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], stave.getWidth() - 100);

    // Draw the voice
    voice.draw(context, stave);
  } catch (error) {
    console.error('Failed to render note group:', error);
  }
};

/**
 * Render a group of notes positioned for side-by-side comparison
 */
export const renderSideBySideNoteGroup = (
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  notesToRender: Note[],
  position: 'left' | 'right',
  style: NoteStyle,
): void => {
  if (notesToRender.length === 0) {
    return;
  }

  try {
    const sortedNotes = [...notesToRender].sort((a, b) => {
      const aPos = pitchToLinePosition(a);
      const bPos = pitchToLinePosition(b);
      return aPos - bPos; // Lower line positions first
    });

    const staveNote = createStaveNote(sortedNotes);
    staveNote.setStyle(style);
    staveNote.setStave(stave);

    // Position the chord based on left/right
    const staffWidth = stave.getWidth();
    const xOffset = position === 'left' ? staffWidth * 0.25 : staffWidth * 0.75;
    staveNote.setXShift(xOffset - stave.getNoteStartX());

    // Create a voice to hold the notes
    const voice = new Voice({
      numBeats: 1,
      beatValue: 4,
    });

    voice.addTickables([staveNote]);

    // Format the voice to fit the stave
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], staffWidth);

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
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  selectedNotes: Note[],
  correctNotes: Note[] = [],
  hoveredPitch: Note | null = null,
  showCorrectAnswer: boolean = false,
  validationResult?: AnswerValidationResult,
): void => {
  try {
    if (showCorrectAnswer && validationResult) {
      // Render both user's answer and correct answer side by side

      // Render user's answer on the left (blue)
      if (selectedNotes.length > 0) {
        renderSideBySideNoteGroup(
          stave,
          context,
          selectedNotes,
          'left',
          { fillStyle: '#3b82f6', strokeStyle: '#3b82f6', opacity: 1 }, // Blue
        );
      }

      // Render correct answer on the right (green)
      if (correctNotes.length > 0) {
        renderSideBySideNoteGroup(
          stave,
          context,
          correctNotes,
          'right',
          { fillStyle: '#059669', strokeStyle: '#059669', opacity: 1 }, // Green
        );
      }
    } else {
      // Normal rendering - just render the selected notes as a chord
      if (selectedNotes.length > 0) {
        renderNoteGroup(
          stave,
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
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  pitch: Note,
  x: number,
  animationState?: 'fadeIn' | 'fadeOut' | null,
): void => {
  try {
    const staveNote = createStaveNote(pitch);

    // Choose style based on animation state
    let style: NoteStyle = NOTE_STYLES.preview;
    if (animationState === 'fadeIn') {
      style = NOTE_STYLES.previewFadeIn;
    } else if (animationState === 'fadeOut') {
      style = NOTE_STYLES.previewFadeOut;
    }

    staveNote.setStyle(style);
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

export const renderPreviewGuidelines = (
  context: any, // VexFlow RenderContext
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
  stave: any, // VexFlow Stave
  context: any, // VexFlow RenderContext
  pitch: Note,
  x: number,
  animationState?: 'fadeIn' | 'fadeOut' | null,
  showGuidelines: boolean = true,
): void => {
  try {
    // Render guidelines if enabled
    if (showGuidelines) {
      renderPreviewGuidelines(context, stave, x);
    }

    // Render the preview note
    renderPreviewNote(stave, context, pitch, x, animationState);
  } catch (error) {
    console.error('Failed to render enhanced preview note:', error);
  }
};

/**
 * Render subtle guidelines to help with note placement
 */

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
