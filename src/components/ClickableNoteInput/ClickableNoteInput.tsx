'use client';

import type { StaffPosition } from './types/StaffInteraction';
import type { Note } from '@/types/MusicTypes';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave } from 'vexflow';
import { clearAndRedrawStaff, renderNotesOnStaff, renderPreviewNote } from './utils/noteRendering';
import { StaffCoordinates } from './utils/staffCoordinates';

const EMPTY_ARRAY: Note[] = [];

/**
 * Props for the ClickableNoteInput component
 */
export type ClickableNoteInputProps = {
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
};

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
  correctNotes = EMPTY_ARRAY,
  validationResult,
  width = 600,
  height = 200,
  disabled = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const staveRef = useRef<any>(null);
  const staffCoordinatesRef = useRef<StaffCoordinates | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<StaffPosition | null>(null);

  // Initialize VexFlow renderer and staff
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    try {
      // Clear any existing content
      containerRef.current.innerHTML = '';

      // Create VexFlow renderer
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();

      // Create staff directly using VexFlow classes
      const stave = new Stave(
        10,
        40,
        // width - 20,
        140,
      );

      // Add clef and time signature
      stave.addClef('treble');
      // stave.addTimeSignature('4/4');

      // Set context and draw
      stave.setContext(context);
      stave.draw();

      // Store references
      rendererRef.current = renderer;
      staveRef.current = stave;
      staffCoordinatesRef.current = new StaffCoordinates(stave);
    } catch (error) {
      console.error('Failed to initialize VexFlow:', error);
      // Fallback: show error message
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div class="p-4 text-red-500">Failed to load music notation</div>';
      }
    }
  }, [width, height]);

  // Handle mouse events for interaction
  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!staffCoordinatesRef.current || disabled) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (staffCoordinatesRef.current.isWithinStaffArea(x, y)) {
      const position = staffCoordinatesRef.current.getNearestStaffPosition(x, y);
      setHoveredPosition(position);
    } else {
      setHoveredPosition(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPosition(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!staffCoordinatesRef.current || disabled) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (staffCoordinatesRef.current.isWithinStaffArea(x, y)) {
      const position = staffCoordinatesRef.current.getNearestStaffPosition(x, y);

      // Toggle note selection
      if (selectedNotes.includes(position.pitch)) {
        onNoteDeselect(position.pitch);
      } else if (selectedNotes.length < maxNotes) {
        onNoteSelect(position.pitch);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    // Basic keyboard support - will be enhanced in task 7
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // TODO: Implement keyboard note placement
    }
  };

  // Render selected notes on the staff
  useEffect(() => {
    if (!rendererRef.current || !staveRef.current || !staffCoordinatesRef.current) {
      return;
    }

    try {
      const context = rendererRef.current.getContext();
      const stave = staveRef.current;

      // Clear and redraw staff
      clearAndRedrawStaff(stave, context);

      // Render selected notes
      if (selectedNotes.length > 0) {
        renderNotesOnStaff(
          stave,
          context,
          selectedNotes,
          correctNotes,
          hoveredPosition?.pitch || null,
          showCorrectAnswer,
          validationResult,
        );
      }

      // Render hover preview if hovering over an empty position
      if (hoveredPosition && !selectedNotes.includes(hoveredPosition.pitch)) {
        renderPreviewNote(
          stave,
          context,
          hoveredPosition.pitch,
          hoveredPosition.x,
        );
      }
    } catch (error) {
      console.error('Failed to render notes:', error);
    }
  }, [selectedNotes, showCorrectAnswer, correctNotes, validationResult, hoveredPosition]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <button
        type="button"
        ref={containerRef}
        className="h-full w-full cursor-pointer rounded border bg-white p-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label="Interactive music staff for note input"
        disabled={disabled}
        style={{
          cursor: disabled ? 'not-allowed' : (hoveredPosition ? 'pointer' : 'default'),
        }}
      />

      {/* Debug info */}
      <div className="mt-2 text-sm text-gray-600">
        Selected:
        {' '}
        {selectedNotes.length}
        {' '}
        /
        {' '}
        {maxNotes}
        {disabled && <span className="ml-2 text-red-500">(Disabled)</span>}
        {hoveredPosition && (
          <span className="ml-2 text-blue-500">
            Hover:
            {' '}
            {hoveredPosition.pitch}
            {' '}
            (line
            {' '}
            {hoveredPosition.linePosition}
            )
          </span>
        )}
      </div>
    </div>
  );
};

export default ClickableNoteInput;
