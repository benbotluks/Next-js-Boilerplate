import type { RefObject } from 'react';
import type { StaffCoordinates } from '../utils/staffCoordinates';
import type { StaffPosition } from '@/MusicTest/types/StaffInteraction';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for managing keyboard navigation and accessibility
 */
export const useKeyboardNavigation = (
  containerRef: RefObject<HTMLDivElement | null>,
  staffCoordinates: StaffCoordinates | null,
  onNotePlace: (position: StaffPosition) => void,
  onNoteDelete?: () => void,
) => {
  const [focusedPosition, setFocusedPosition] = useState<StaffPosition | null>(null);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [validPositions, _] = useState<StaffPosition[]>([]);

  // Initialize valid positions when staff coordinates are available
  // useEffect(() => {
  //   if (staffCoordinates) {
  //     const positions = staffCoordinates.treble?.getAllValidPositions();
  //     if (!positions) {
  //       return;
  //     }
  //     setValidPositions(positions);

  //     // Don't set initial focus - only set focus when keyboard mode is actually activated
  //   }
  // }, [staffCoordinates]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!staffCoordinates || validPositions.length === 0) {
      return;
    }

    const { key, ctrlKey, metaKey, shiftKey } = event;

    // Only enable keyboard mode for actual navigation keys, not just any key
    const isNavigationKey = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Delete', 'Backspace', 'Escape', 'Home', 'End'].includes(key)
      || ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(key.toUpperCase());

    if (!keyboardMode && isNavigationKey) {
      setKeyboardMode(true);

      // Set initial focus when entering keyboard mode
      if (!focusedPosition && validPositions.length > 0) {
        const middleC = validPositions.find(pos => pos.linePosition === 4) || validPositions[Math.floor(validPositions.length / 2)];
        if (middleC) {
          setFocusedPosition(middleC);
        }
      }
    }

    switch (key) {
      case 'Tab': {
        // Tab navigation through staff positions
        event.preventDefault();
        const currentIndex = focusedPosition
          ? validPositions.findIndex(pos => pos.linePosition === focusedPosition.linePosition)
          : -1;

        const nextIndex = shiftKey
          ? (currentIndex <= 0 ? validPositions.length - 1 : currentIndex - 1)
          : (currentIndex >= validPositions.length - 1 ? 0 : currentIndex + 1);

        const nextPosition = validPositions[nextIndex];
        if (nextPosition) {
          setFocusedPosition(nextPosition);
        }
        break;
      }

      case 'ArrowUp': {
        // Move up one staff position
        event.preventDefault();
        if (focusedPosition) {
          const currentIndex = validPositions.findIndex(pos => pos.linePosition === focusedPosition.linePosition);
          const nextIndex = Math.min(currentIndex + 1, validPositions.length - 1);
          const nextPosition = validPositions[nextIndex];
          if (nextPosition) {
            setFocusedPosition(nextPosition);
          }
        }
        break;
      }

      case 'ArrowDown': {
        // Move down one staff position
        event.preventDefault();
        if (focusedPosition) {
          const currentIndex = validPositions.findIndex(pos => pos.linePosition === focusedPosition.linePosition);
          const nextIndex = Math.max(currentIndex - 1, 0);
          const nextPosition = validPositions[nextIndex];
          nextPosition && setFocusedPosition(nextPosition);
        }
        break;
      }

      case 'ArrowLeft':
      case 'ArrowRight': {
        // Prevent default but don't change position (could be used for note duration in future)
        event.preventDefault();
        break;
      }

      case 'Enter':
      case ' ': {
        // Place note at focused position
        event.preventDefault();
        if (focusedPosition) {
          onNotePlace(focusedPosition);
        }
        break;
      }

      case 'Delete':
      case 'Backspace': {
        // Delete selected notes
        event.preventDefault();
        if (onNoteDelete) {
          onNoteDelete();
        }
        break;
      }

      case 'Escape': {
        // Exit keyboard mode
        event.preventDefault();
        setKeyboardMode(false);
        setFocusedPosition(null);
        containerRef.current?.blur();
        break;
      }

      case 'Home': {
        // Go to lowest position
        event.preventDefault();
        const firstPosition = validPositions[0];
        firstPosition && setFocusedPosition(firstPosition);

        break;
      }

      case 'End': {
        // Go to highest position
        event.preventDefault();
        const lastPosition = validPositions[validPositions.length - 1];
        lastPosition && setFocusedPosition(lastPosition);

        break;
      }

      default: {
        // Handle note name shortcuts (C, D, E, F, G, A, B)
        const noteName = key.toUpperCase();
        if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(noteName)) {
          event.preventDefault();

          // Find the closest position with this note name
          const targetPosition = validPositions.find(pos =>
            pos.pitch.noteClass === noteName,
          );

          if (targetPosition) {
            setFocusedPosition(targetPosition);
            // Optionally place the note immediately
            if (ctrlKey || metaKey) {
              onNotePlace(targetPosition);
            }
          }
        }
        break;
      }
    }
  }, [
    staffCoordinates,
    validPositions,
    focusedPosition,
    keyboardMode,
    onNotePlace,
    onNoteDelete,
    containerRef,
  ]);

  // Set up keyboard event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Make container focusable
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '0');
    }

    // Add keyboard event listener
    container.addEventListener('keydown', handleKeyDown);

    // Handle focus events - don't automatically enable keyboard mode
    const handleFocus = () => {
      // Only enable keyboard mode if it was triggered by actual keyboard navigation
      // The keyboard mode will be enabled by handleKeyDown when appropriate keys are pressed
    };

    const handleBlur = () => {
      // Don't immediately disable keyboard mode on blur
      // Let user navigate back with tab
    };

    container.addEventListener('focus', handleFocus);
    container.addEventListener('blur', handleBlur);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focus', handleFocus);
      container.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, containerRef]);

  // Provide method to programmatically set focus
  const setFocus = useCallback((position: StaffPosition | null) => {
    setFocusedPosition(position);
    if (position) {
      setKeyboardMode(true);
      containerRef.current?.focus();
    }
  }, [containerRef]);

  // Method to move focus by relative steps
  const moveFocus = useCallback((steps: number) => {
    if (!focusedPosition || validPositions.length === 0) {
      return;
    }

    const currentIndex = validPositions.findIndex(pos => pos.linePosition === focusedPosition.linePosition);
    const newIndex = Math.max(0, Math.min(validPositions.length - 1, currentIndex + steps));
    const newPosition = validPositions[newIndex];
    if (newPosition) {
      setFocusedPosition(newPosition);
    }
  }, [focusedPosition, validPositions]);

  // Method to disable keyboard mode (called from mouse events)
  const disableKeyboardMode = useCallback(() => {
    setKeyboardMode(false);
    setFocusedPosition(null);
  }, []);

  // Method to handle mouse leave - always clear keyboard state when mouse leaves
  const handleMouseLeave = useCallback(() => {
    setKeyboardMode(false);
    setFocusedPosition(null);
  }, []);

  return {
    handleKeyDown,
    focusedPosition,
    keyboardMode,
    setFocus,
    moveFocus,
    validPositions,
    disableKeyboardMode,
    handleMouseLeave,
  };
};
