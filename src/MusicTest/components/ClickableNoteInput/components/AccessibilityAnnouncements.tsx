'use client';

import React, { useEffect, useRef } from 'react';
import type { Note } from '@/MusicTest/types';
import type { StaffPosition } from '../types/StaffInteraction';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import { toDisplayFormat } from '@/utils/musicUtils';

type AccessibilityAnnouncementsProps = {
  selectedNotes: Note[];
  focusedPosition: StaffPosition | null;
  hoveredPosition: StaffPosition | null;
  keyboardMode: boolean;
  validationResult?: AnswerValidationResult;
  maxNotes: number;
};

/**
 * Component that provides live accessibility announcements for screen readers
 */
export const AccessibilityAnnouncements: React.FC<AccessibilityAnnouncementsProps> = ({
  selectedNotes,
  focusedPosition,
  keyboardMode,
  validationResult,
  maxNotes,
}) => {
  const previousSelectedNotes = useRef<Note[]>([]);
  const previousFocusedPosition = useRef<StaffPosition | null>(null);
  const previousKeyboardMode = useRef<boolean>(false);
  const previousValidationResult = useRef<AnswerValidationResult | undefined>(undefined);

  // Announce note selection changes
  useEffect(() => {
    const prev = previousSelectedNotes.current;
    const current = selectedNotes;

    if (prev.length !== current.length) {
      const added = current.filter(note => !prev.includes(note));
      const removed = prev.filter(note => !current.includes(note));

      if (added.length > 0) {
        const announcement = added.length === 1
          ? `Added note ${toDisplayFormat(added[0]!)}`
          : `Added ${added.length} notes: ${added.map(toDisplayFormat).join(', ')}`;
        announceToScreenReader(announcement);
      }

      if (removed.length > 0) {
        const announcement = removed.length === 1
          ? `Removed note ${toDisplayFormat(removed[0]!)}`
          : `Removed ${removed.length} notes: ${removed.map(toDisplayFormat).join(', ')}`;
        announceToScreenReader(announcement);
      }

      // Announce current count
      if (current.length > 0) {
        announceToScreenReader(`${current.length} of ${maxNotes} notes selected`);
      } else {
        announceToScreenReader('No notes selected');
      }
    }

    previousSelectedNotes.current = [...current];
  }, [selectedNotes, maxNotes]);

  // Announce focus position changes in keyboard mode
  useEffect(() => {
    if (keyboardMode && focusedPosition &&
      (!previousFocusedPosition.current ||
        previousFocusedPosition.current.pitch !== focusedPosition.pitch)) {

      const pitchName = toDisplayFormat(focusedPosition.pitch);
      const positionType = focusedPosition.isLine ? 'line' : 'space';
      const ledgerInfo = focusedPosition.requiresLedgerLine ? ' with ledger line' : '';
      const isSelected = selectedNotes.includes(focusedPosition.pitch) ? ', selected' : '';

      announceToScreenReader(`Focused on ${pitchName} ${positionType}${ledgerInfo}${isSelected}`);
    }

    previousFocusedPosition.current = focusedPosition;
  }, [focusedPosition, keyboardMode, selectedNotes]);

  // Announce keyboard mode changes
  useEffect(() => {
    if (keyboardMode !== previousKeyboardMode.current) {
      if (keyboardMode) {
        announceToScreenReader('Keyboard navigation mode enabled. Use arrow keys to navigate, Enter or Space to place notes, Delete to remove notes, Escape to exit.');
      } else {
        announceToScreenReader('Keyboard navigation mode disabled');
      }
    }

    previousKeyboardMode.current = keyboardMode;
  }, [keyboardMode]);

  // Announce validation results
  useEffect(() => {
    if (validationResult && validationResult !== previousValidationResult.current) {
      if (validationResult.isCorrect) {
        announceToScreenReader('Answer is correct!');
      } else {
        announceToScreenReader('Answer is incorrect. Try again.');
      }
    }

    previousValidationResult.current = validationResult;
  }, [validationResult]);

  return (
    <>
      {/* Screen reader only announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="staff-announcements"
      />

      {/* Additional context for screen readers */}
      <div className="sr-only">
        <h3>Music Staff Instructions</h3>
        <p>
          This is an interactive music staff where you can place notes by clicking or using keyboard navigation.
        </p>
        <ul>
          <li>Click on staff lines or spaces to place notes</li>
          <li>Press Tab to enter keyboard navigation mode</li>
          <li>Use arrow keys to move between staff positions</li>
          <li>Press Enter or Space to place a note at the focused position</li>
          <li>Press Delete to remove selected notes</li>
          <li>Press Escape to exit keyboard navigation mode</li>
          <li>Use letter keys (C, D, E, F, G, A, B) to jump to specific note names</li>
          <li>Hold Ctrl/Cmd while pressing a letter key to immediately place that note</li>
        </ul>

        {selectedNotes.length > 0 && (
          <div>
            <h4>Currently Selected Notes:</h4>
            <ul>
              {selectedNotes.map((note, index) => (
                <li key={`${toDisplayFormat(note)}-${index}`}>{toDisplayFormat(note)}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult && (
          <div>
            <h4>Validation Result:</h4>
            <p>{validationResult.isCorrect ? 'Correct' : 'Incorrect'}</p>
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Utility function to announce messages to screen readers
 */
function announceToScreenReader(message: string) {
  const announceElement = document.getElementById('staff-announcements');
  if (announceElement) {
    // Clear and set new message
    announceElement.textContent = '';
    setTimeout(() => {
      announceElement.textContent = message;
    }, 100);
  }
}