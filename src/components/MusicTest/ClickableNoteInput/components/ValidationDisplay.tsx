'use client';

import type { Note } from '@/types/MusicTypes';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import React, { useEffect, useState } from 'react';
import styles from '../ClickableNoteInput.module.css';

export type ValidationDisplayProps = {
  selectedNotes: Note[];
  correctNotes: Note[];
  validationResult?: AnswerValidationResult;
  showCorrectAnswer: boolean;
  className?: string;
};

/**
 * Component to display validation results with animations
 */
export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  selectedNotes,
  correctNotes,
  validationResult,
  showCorrectAnswer,
  className = '',
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'partial'>('success');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!validationResult && !showCorrectAnswer) {
      setShowMessage(false);
      return;
    }

    // Calculate validation state
    const correctSelected = selectedNotes.filter(note => correctNotes.includes(note));
    const incorrectSelected = selectedNotes.filter(note => !correctNotes.includes(note));
    const _missingNotes = correctNotes.filter(note => !selectedNotes.includes(note));

    let newMessageType: 'success' | 'error' | 'partial' = 'success';
    let newMessage = '';

    if (showCorrectAnswer) {
      if (correctSelected.length === correctNotes.length && incorrectSelected.length === 0) {
        newMessageType = 'success';
        newMessage = 'Perfect! All notes are correct.';
      } else if (correctSelected.length > 0) {
        newMessageType = 'partial';
        newMessage = `${correctSelected.length}/${correctNotes.length} correct notes`;
      } else {
        newMessageType = 'error';
        newMessage = 'No correct notes selected';
      }
    } else if (validationResult) {
      // Use validation result if available
      if (correctSelected.length === correctNotes.length && incorrectSelected.length === 0) {
        newMessageType = 'success';
        newMessage = 'Excellent! All notes are correct.';
      } else {
        newMessageType = 'error';
        newMessage = 'Some notes are incorrect. Try again!';
      }
    }

    setMessageType(newMessageType);
    setMessage(newMessage);
    setShowMessage(true);

    // Auto-hide message after 3 seconds
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedNotes, correctNotes, validationResult, showCorrectAnswer]);

  if (!showMessage || !message) {
    return null;
  }

  return (
    <div className={`${styles.validationOverlay} ${className}`}>
      <div className={`${styles.validationMessage} ${styles[messageType]}`}>
        {message}
      </div>
    </div>
  );
};

/**
 * Get validation statistics for display
 */
export const getValidationStats = (
  selectedNotes: Note[],
  correctNotes: Note[],
): {
  correct: number;
  incorrect: number;
  missing: number;
  total: number;
  accuracy: number;
} => {
  const correctSelected = selectedNotes.filter(note => correctNotes.includes(note));
  const incorrectSelected = selectedNotes.filter(note => !correctNotes.includes(note));
  const missingNotes = correctNotes.filter(note => !selectedNotes.includes(note));

  return {
    correct: correctSelected.length,
    incorrect: incorrectSelected.length,
    missing: missingNotes.length,
    total: correctNotes.length,
    accuracy: correctNotes.length > 0 ? (correctSelected.length / correctNotes.length) * 100 : 0,
  };
};

/**
 * Component to display detailed validation statistics
 */
export const ValidationStats: React.FC<{
  selectedNotes: Note[];
  correctNotes: Note[];
  className?: string;
}> = ({ selectedNotes, correctNotes, className = '' }) => {
  const stats = getValidationStats(selectedNotes, correctNotes);

  return (
    <div className={`space-y-1 text-sm ${className}`}>
      <div className="flex justify-between">
        <span>Correct:</span>
        <span className="font-medium text-green-600">
          {stats.correct}
          /
          {stats.total}
        </span>
      </div>
      {stats.incorrect > 0 && (
        <div className="flex justify-between">
          <span>Incorrect:</span>
          <span className="font-medium text-red-600">{stats.incorrect}</span>
        </div>
      )}
      {stats.missing > 0 && (
        <div className="flex justify-between">
          <span>Missing:</span>
          <span className="font-medium text-orange-600">{stats.missing}</span>
        </div>
      )}
      <div className="flex justify-between border-t pt-1">
        <span>Accuracy:</span>
        <span className={`font-medium ${
          stats.accuracy >= 80
            ? 'text-green-600'
            : stats.accuracy >= 60 ? 'text-orange-600' : 'text-red-600'
        }`}
        >
          {stats.accuracy.toFixed(0)}
          %
        </span>
      </div>
    </div>
  );
};
