import type { StaffPosition } from '../types/StaffInteraction';
import type { Note } from '@/types';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import { toDisplayFormat } from '@/utils/musicUtils';

/**
 * Generates the main ARIA label for the music staff
 */
export const getStaffAriaLabel = (
  selectedNotes: Note[],
  maxNotes: number,
  keyboardMode: boolean,
): string => {
  const baseLabel = 'Interactive music staff for note input';
  const noteCount = `${selectedNotes.length} of ${maxNotes} notes selected`;
  const instructions = keyboardMode
    ? 'Use arrow keys to navigate, Enter or Space to place notes, Delete to remove selected notes, Escape to exit keyboard mode'
    : 'Click to place notes, Tab to enter keyboard mode';

  return `${baseLabel}. ${noteCount}. ${instructions}`;
};

/**
 * Generates the detailed ARIA description for screen readers
 */
export const getStaffAriaDescription = (
  selectedNotes: Note[],
  focusedPosition: StaffPosition | null,
  hoveredPosition: StaffPosition | null,
  keyboardMode: boolean,
  validationResult?: AnswerValidationResult,
): string => {
  let description = '';

  if (focusedPosition && keyboardMode) {
    const pitchName = toDisplayFormat(focusedPosition.pitch);
    const positionType = focusedPosition.isLine ? 'line' : 'space';
    const ledgerInfo = focusedPosition.requiresLedgerLine ? ' with ledger line' : '';
    description += `Focused on ${pitchName} ${positionType}${ledgerInfo}. `;
  }

  if (hoveredPosition && !keyboardMode) {
    description += `Hovering over ${hoveredPosition.pitch}. `;
  }

  if (selectedNotes.length > 0) {
    description += `Selected notes: ${selectedNotes.join(', ')}. `;
  }

  if (validationResult) {
    if (validationResult.isCorrect) {
      description += 'Answer is correct. ';
    } else {
      description += 'Answer is incorrect. ';
    }
  }

  return description.trim();
};

export const requiresLedgerLine = (linePosition: number): boolean => {
  return (linePosition === 0 || Math.abs(linePosition) >= 12);
};
