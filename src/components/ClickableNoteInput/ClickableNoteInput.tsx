'use client';

import type { StaffPosition } from './types/StaffInteraction';
import type { Note } from '@/types/MusicTypes';
import type { ValidationResult as AnswerValidationResult } from '@/utils/AnswerValidation';
import React, { useCallback, useEffect, useRef } from 'react';
import { Renderer, Stave } from 'vexflow';
import { AccessibilityAnnouncements, KeyboardShortcuts, NoteContextMenu, ValidationDisplay, ValidationStats } from './components';
import { useKeyboardNavigation } from './hooks';
import { useNoteManagement } from './hooks/useNoteManagement';
import { useNoteSelection } from './hooks/useNoteSelection';
import { useStaffInteraction } from './hooks/useStaffInteraction';
import { clearAndRedrawStaff, renderEnhancedPreviewNote, renderNotesOnStaff } from './utils/noteRendering';
import { StaffCoordinates } from './utils/staffCoordinates';

const EMPTY_ARRAY: Note[] = [];

/**
 * Props for the ClickableNoteInput component
 */
export type ClickableNoteInputProps = {

  selectedNotes: Note[];
  onNoteSelect: (note: Note) => void;
  onNoteDeselect: (note: Note) => void;
  maxNotes: number;
  showCorrectAnswer?: boolean;
  correctNotes?: Note[];
  validationResult?: AnswerValidationResult;
  width?: number;
  height?: number;
  disabled?: boolean;
  className?: string;
};

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const staveRef = useRef<any>(null);
  const staffCoordinatesRef = useRef<StaffCoordinates | null>(null);

  // Use note management hook
  const {
    toggleNote,
    canAddNote,
    removeNotes,
  } = useNoteManagement(selectedNotes, onNoteSelect, onNoteDeselect, maxNotes);

  // Use note selection hook
  const {
    contextMenuNote,
    contextMenuPosition,
    handleContextMenu,
    closeContextMenu,
    handleContextMenuAction,
    isNoteSelected: isInternallySelected,
  } = useNoteSelection(selectedNotes, onNoteDeselect, removeNotes);

  // Handle note click from staff interaction
  const handleNoteClick = (position: StaffPosition) => {
    if (disabled) {
      return;
    }

    // Toggle note selection
    toggleNote(position.pitch);
  };

  // Handle right-click on notes
  const handleNoteRightClick = (event: React.MouseEvent, note: Note) => {
    if (disabled) {
      return;
    }
    handleContextMenu(event, note);
  };

  // Use staff interaction hook
  const {
    handleMouseMove: staffHandleMouseMove,
    handleMouseClick: staffHandleMouseClick,
    handleMouseLeave: staffHandleMouseLeave,
    hoveredPosition,
    previewAnimation,
    getCursorStyle,
    isOverInteractiveArea,
  } = useStaffInteraction(
    containerRef,
    staffCoordinatesRef,
    handleNoteClick,
    disabled,
  );

  const {
    focusedPosition,
    keyboardMode,
    disableKeyboardMode,
    handleKeyDown,
    handleMouseLeave: keyboardHandleMouseLeave,
  } = useKeyboardNavigation(
    containerRef,
    staffCoordinatesRef.current,
    handleNoteClick,
    () => {
      // Delete selected notes
      const selectedNotesToDelete = selectedNotes.filter(note => note);
      if (selectedNotesToDelete.length > 0) {
        selectedNotesToDelete.forEach(note => onNoteDeselect(note));
      }
    },
  );

  // Enhanced mouse handlers that also manage keyboard mode
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    staffHandleMouseMove(event);
    if (keyboardMode) {
      disableKeyboardMode();
    }
  }, [staffHandleMouseMove, keyboardMode, disableKeyboardMode]);

  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    staffHandleMouseClick(event);
    if (keyboardMode) {
      disableKeyboardMode();
    }
  }, [staffHandleMouseClick, keyboardMode, disableKeyboardMode]);

  const handleMouseLeave = useCallback(() => {
    staffHandleMouseLeave();
    keyboardHandleMouseLeave();
  }, [staffHandleMouseLeave, keyboardHandleMouseLeave]);

  // Use keyboard navigation hook

  // Initialize VexFlow renderer and staff
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    try {
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

  // Generate accessibility announcements
  const getAriaLabel = () => {
    const baseLabel = 'Interactive music staff for note input';
    const noteCount = `${selectedNotes.length} of ${maxNotes} notes selected`;
    const instructions = keyboardMode
      ? 'Use arrow keys to navigate, Enter or Space to place notes, Delete to remove selected notes, Escape to exit keyboard mode'
      : 'Click to place notes, Tab to enter keyboard mode';

    return `${baseLabel}. ${noteCount}. ${instructions}`;
  };

  const getAriaDescription = () => {
    let description = '';

    if (focusedPosition && keyboardMode) {
      const pitchName = focusedPosition.pitch;
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

      // Render preview note - prioritize hover over focus
      if (!keyboardMode && hoveredPosition && !selectedNotes.includes(hoveredPosition.pitch)) {
        // Mouse mode: show hover preview
        renderEnhancedPreviewNote(
          stave,
          context,
          hoveredPosition.pitch,
          hoveredPosition.x,
          previewAnimation,
          true, // Show guidelines
        );
      } else if (keyboardMode && focusedPosition && !selectedNotes.includes(focusedPosition.pitch)) {
        // Keyboard mode: show focus preview
        renderEnhancedPreviewNote(
          stave,
          context,
          focusedPosition.pitch,
          focusedPosition.x,
          previewAnimation,
          true, // Show guidelines
        );
      }
    } catch (error) {
      console.error('Failed to render notes:', error);
    }
  }, [selectedNotes, showCorrectAnswer, correctNotes, validationResult, hoveredPosition, previewAnimation, focusedPosition, keyboardMode]);

  return (
    <div className={`${className}`}>
      {/* Main staff container */}
      <div className="relative" style={{ width, height }}>
        <div
          ref={containerRef}
          className={`
          h-full w-full rounded border bg-white p-0 transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-60' : ''}
          ${isOverInteractiveArea() ? 'shadow-md' : ''}
          ${keyboardMode ? 'ring-2 ring-blue-500/50' : ''}
          ${disabled ? '' : hoveredPosition ? 'cursor-crosshair' : 'cursor-default'}
        `}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleMouseClick}

          onContextMenu={(e) => {
          // Handle right-click on staff area
            if (hoveredPosition && selectedNotes.includes(hoveredPosition.pitch)) {
              handleNoteRightClick(e, hoveredPosition.pitch);
            }
          }}
          // Accessibility attributes
          role="button"
          aria-label={getAriaLabel()}
          aria-describedby="staff-description"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          // Additional ARIA attributes for screen readers
          aria-keyshortcuts="Tab ArrowUp ArrowDown Enter Space Delete Escape"
          style={{
            cursor: getCursorStyle(),
          }}
        />

        {/* Context Menu - positioned relative to staff */}
        {contextMenuNote && contextMenuPosition && (
          <NoteContextMenu
            note={contextMenuNote}
            position={contextMenuPosition}
            isSelected={isInternallySelected(contextMenuNote)}
            onAction={handleContextMenuAction}
            onClose={closeContextMenu}
          />
        )}
      </div>

      {/* Hidden description for screen readers */}
      <div id="staff-description" className="sr-only">
        {getAriaDescription()}
      </div>

      {/* Accessibility Announcements */}
      <AccessibilityAnnouncements
        selectedNotes={selectedNotes}
        focusedPosition={focusedPosition}
        hoveredPosition={hoveredPosition}
        keyboardMode={keyboardMode}
        validationResult={validationResult}
        maxNotes={maxNotes}
      />

      {/* Validation Display */}
      <ValidationDisplay
        selectedNotes={selectedNotes}
        correctNotes={correctNotes}
        validationResult={validationResult}
        showCorrectAnswer={showCorrectAnswer}
      />

      {/* Validation Stats */}
      {(showCorrectAnswer || validationResult) && (
        <div className="mt-2 rounded border bg-gray-50 p-2">
          <ValidationStats
            selectedNotes={selectedNotes}
            correctNotes={correctNotes}
          />
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcuts className="mt-2" />

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
        {keyboardMode && <span className="ml-2 text-blue-500">(Keyboard Mode)</span>}
        {focusedPosition && keyboardMode && (
          <span className="ml-2 text-purple-500">
            Focus:
            {' '}
            {focusedPosition.pitch}
            {' '}
            (line
            {' '}
            {focusedPosition.linePosition}
            )
          </span>
        )}
        {hoveredPosition && !keyboardMode && (
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
        {canAddNote()
          ? (
              <span className="ml-2 text-green-500">Can add more notes</span>
            )
          : (
              <span className="ml-2 text-orange-500">Maximum notes reached</span>
            )}
      </div>
    </div>
  );
};

export default ClickableNoteInput;
