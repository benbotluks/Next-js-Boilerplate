import type { RefObject } from 'react';
import type { StaffPosition } from '../types/StaffInteraction';
import type { StaffCoordinates } from '../utils/staffCoordinates';
import { useCallback, useState } from 'react';

/**
 * Hook for managing staff interaction (mouse and touch events)
 * Handles coordinate conversion, hit detection, and hover state management
 */
export const useStaffInteraction = (
  containerRef: RefObject<HTMLDivElement> | null,
  staffCoordinatesRef: RefObject<StaffCoordinates>,
  onNoteClick: (position: StaffPosition) => void,
  disabled: boolean = false,
) => {
  const [hoveredPosition, setHoveredPosition] = useState<StaffPosition | null>(null);

  /**
   * Handle mouse move events for hover preview
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef || !staffCoordinatesRef.current || disabled) {
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
  }, [staffCoordinatesRef, disabled, containerRef]);

  /**
   * Handle mouse click events for note placement
   */
  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef || !staffCoordinatesRef.current || disabled) {
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
      onNoteClick(position);
    }
  }, [staffCoordinatesRef, disabled, containerRef, onNoteClick]);

  /**
   * Handle mouse leave events to clear hover state
   */
  const handleMouseLeave = useCallback(() => {
    setHoveredPosition(null);
  }, []);

  /**
   * Get cursor style based on interaction state
   */
  const getCursorStyle = useCallback(() => {
    if (disabled) {
      return 'not-allowed';
    }
    if (hoveredPosition) {
      return 'pointer';
    }
    return 'default';
  }, [disabled, hoveredPosition]);

  return {
    // Event handlers
    handleMouseMove,
    handleMouseClick,
    handleMouseLeave,

    // State
    hoveredPosition,

    // Utilities
    getCursorStyle,
  };
};
