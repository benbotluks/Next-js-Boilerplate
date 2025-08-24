import type { RefObject } from 'react';
import type { StaffPosition } from '../types/StaffInteraction';
import type { StaffCoordinates } from '../utils/staffCoordinates';
import { useCallback, useRef, useState } from 'react';

/**
 * Hook for managing staff interaction (mouse and touch events)
 * Handles coordinate conversion, hit detection, and hover state management
 */
export const useStaffInteraction = (
  containerRef: RefObject<HTMLDivElement | null>,
  staffCoordinatesRef: RefObject<StaffCoordinates | null>,
  onNoteClick: (position: StaffPosition) => void,
  disabled: boolean = false,
) => {
  const [hoveredPosition, setHoveredPosition] = useState<StaffPosition | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [previewAnimation, setPreviewAnimation] = useState<'fadeIn' | 'fadeOut' | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle mouse move events for hover preview with smooth transitions
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef || !staffCoordinatesRef.current || disabled) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (staffCoordinatesRef.current.isWithinStaffArea(x, y)) {
      const position = staffCoordinatesRef.current.getNearestStaffPosition(x, y);

      // Only update if position actually changed to avoid unnecessary re-renders
      if (!hoveredPosition
        || hoveredPosition.pitch !== position.pitch
        || Math.abs(hoveredPosition.x - position.x) > 5) {
        if (!isHovering) {
          setIsHovering(true);
          setPreviewAnimation('fadeIn');
        }

        setHoveredPosition(position);

        // Clear animation state after animation completes
        hoverTimeoutRef.current = setTimeout(() => {
          setPreviewAnimation(null);
        }, 150);
      }
    } else {
      // Mouse is outside staff area
      if (isHovering) {
        setPreviewAnimation('fadeOut');
        setIsHovering(false);

        // Clear hover position after fade out animation
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredPosition(null);
          setPreviewAnimation(null);
        }, 150);
      }
    }
  }, [staffCoordinatesRef, disabled, containerRef, hoveredPosition, isHovering]);

  /**
   * Handle mouse click events for note placement
   */
  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef || !staffCoordinatesRef.current || disabled) {
      return;
    }

    // Prevent context menu on right click - we'll handle it ourselves
    if (event.button === 2) {
      event.preventDefault();
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
   * Handle right-click events for context menu
   */
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent browser context menu

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
      // Create a special position object with context menu coordinates
      const contextMenuPosition = {
        ...position,
        contextMenu: {
          x: event.clientX,
          y: event.clientY,
        },
      };
      onNoteClick(contextMenuPosition as any);
    }
  }, [staffCoordinatesRef, disabled, containerRef, onNoteClick]);

  /**
   * Handle mouse leave events to clear hover state with animation
   */
  const handleMouseLeave = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (isHovering) {
      setPreviewAnimation('fadeOut');
      setIsHovering(false);

      // Clear hover position after fade out animation
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredPosition(null);
        setPreviewAnimation(null);
      }, 150);
    }
  }, [isHovering]);

  /**
   * Get cursor style based on interaction state
   */
  const getCursorStyle = useCallback(() => {
    if (disabled) {
      return 'not-allowed';
    }
    if (hoveredPosition) {
      return 'crosshair'; // More precise cursor for note placement
    }
    return 'default';
  }, [disabled, hoveredPosition]);

  /**
   * Get CSS class for cursor styling
   */
  const getCursorClass = useCallback(() => {
    if (disabled) {
      return 'cursorNotAllowed';
    }
    if (hoveredPosition) {
      return 'cursorCrosshair';
    }
    return 'cursorDefault';
  }, [disabled, hoveredPosition]);

  /**
   * Check if mouse is currently over an interactive area
   */
  const isOverInteractiveArea = useCallback(() => {
    return hoveredPosition !== null;
  }, [hoveredPosition]);

  return {
    // Event handlers
    handleMouseMove,
    handleMouseClick,
    handleMouseLeave,
    handleContextMenu,

    // State
    hoveredPosition,
    isHovering,
    previewAnimation,

    // Utilities
    getCursorStyle,
    getCursorClass,
    isOverInteractiveArea,
  };
};
