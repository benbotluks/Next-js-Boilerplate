import type VexFlow from 'vexflow';
import type { Note } from '@/types/MusicTypes';

/**
 * Result of answer validation containing detailed feedback information
 */
export type ValidationResult = {
  isCorrect: boolean;
  correctNotes: Note[];
  selectedNotes: Note[];
  correctlyIdentified: Note[];
  missedNotes: Note[];
  incorrectNotes: Note[];
  accuracy: number; // Percentage (0-100)
};

/**
 * Validates user's note selection against the correct answer
 * @param correctNotes - The actual notes that were played
 * @param selectedNotes - The notes the user selected
 * @returns Detailed validation result with feedback information
 */
export function validateAnswer(
  correctNotes: Note[],
  selectedNotes: Note[],
): ValidationResult {
  // Normalize arrays by sorting and removing duplicates
  const normalizedCorrect = [...new Set(correctNotes)].sort();
  const normalizedSelected = [...new Set(selectedNotes)].sort();

  // Find correctly identified notes (intersection)
  const correctlyIdentified = normalizedSelected.filter(note =>
    normalizedCorrect.includes(note),
  );

  // Find missed notes (in correct but not selected)
  const missedNotes = normalizedCorrect.filter(note =>
    !normalizedSelected.includes(note),
  );

  // Find incorrect notes (selected but not in correct)
  const incorrectNotes = normalizedSelected.filter(note =>
    !normalizedCorrect.includes(note),
  );

  // Calculate accuracy as percentage of correctly identified notes
  const accuracy = normalizedCorrect.length > 0
    ? Math.round((correctlyIdentified.length / normalizedCorrect.length) * 100)
    : 0;

  // Answer is correct if all notes match exactly
  const isCorrect = normalizedCorrect.length === normalizedSelected.length
    && correctlyIdentified.length === normalizedCorrect.length
    && incorrectNotes.length === 0;

  return {
    isCorrect,
    correctNotes: normalizedCorrect,
    selectedNotes: normalizedSelected,
    correctlyIdentified,
    missedNotes,
    incorrectNotes,
    accuracy,
  };
}

/**
 * Generates a human-readable feedback message based on validation result
 * @param result - The validation result from validateAnswer
 * @returns Formatted feedback message
 */
export function generateFeedbackMessage(result: ValidationResult): string {
  if (result.isCorrect) {
    return 'Perfect! You identified all notes correctly.';
  }

  const messages: string[] = [];

  if (result.correctlyIdentified.length > 0) {
    messages.push(
      `You correctly identified ${result.correctlyIdentified.length} out of ${result.correctNotes.length} notes.`,
    );
  }

  if (result.missedNotes.length > 0) {
    messages.push(
      `You missed: ${result.missedNotes.join(', ')}.`,
    );
  }

  if (result.incorrectNotes.length > 0) {
    messages.push(
      `Incorrect selections: ${result.incorrectNotes.join(', ')}.`,
    );
  }

  return messages.join(' ');
}

/**
 * Determines the color coding for a note in the feedback display
 * @param note - The note to get color for
 * @param result - The validation result
 * @returns CSS color class or hex color
 */
export function getNoteDisplayColor(
  note: Note | VexFlow.StaveNote,
  result: ValidationResult,
): { color: string; label: string } {
  if (result.correctlyIdentified.includes(note)) {
    return { color: '#22c55e', label: 'Correct' }; // Green
  }

  if (result.incorrectNotes.includes(note)) {
    return { color: '#ef4444', label: 'Incorrect' }; // Red
  }

  if (result.missedNotes.includes(note)) {
    return { color: '#f59e0b', label: 'Missed' }; // Amber/Orange
  }

  // Default color for unselected notes
  return { color: '#6b7280', label: 'Unselected' }; // Gray
}
