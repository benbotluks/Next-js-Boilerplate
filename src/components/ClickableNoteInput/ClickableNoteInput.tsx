'use client';

import type { Note } from '@/types/MusicTypes';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import React from 'react';

/**
 * Props for the ClickableNoteInput component
 */
export interface ClickableNoteInputProps {
  /** Currently selected notes */
  selectedNotes: Note[];
  /** Callback when a note is selected */
  onNoteSelect: (note: Note) => void;
  /** Callback when a note is deselected */
  onNoteDeselect: (note: Note) => void;
  /** Maximum number of notes that can be selected */
  maxNotes: number;
  /** Whether to show correct answer highlighting */
  showCorrectAnswer?: boolean;
  /** Array of correct notes for validation display */
  correctNotes?: Note[];
  /** Validation result for displaying correct/incorrect states */
  validationResult?: AnswerValidationResult;
  /** Width of the component in pixels */
  width?: number;
  /** Height of the component in pixels */
  height?: number;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Interactive musical staff component that allows clicking to input notes
 * Similar to MuseScore's note input interface
 */
const ClickableNoteInput: React.FC<ClickableNoteInputProps> = ({
  selectedNotes,
  onNoteSelect,
  onNoteDeselect,
  maxNotes,
  showCorrectAnswer = false,
  correctNotes = [],
  validationResult,
  width = 600,
  height = 200,
  disabled = false,
  className = '',
}) => {
  // Component implementation will be added in subsequent tasks
  
  return (
    <div 
      className={`clickable-note-input ${className}`}
      style={{ width, height }}
    >
      <div id="vexflow-container" className="w-full h-full border rounded bg-white" />
      
      {/* Debug info - will be removed in final implementation */}
      <div className="mt-2 text-sm text-gray-600">
        Selected: {selectedNotes.length} / {maxNotes}
        {disabled && <span className="ml-2 text-red-500">(Disabled)</span>}
      </div>
    </div>
  );
};

export default ClickableNoteInput;