import type { Note } from '@/types/';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for managing note selection state and deletion features
 * Handles keyboard delete functionality and right-click context menus
 */
export const useNoteSelection = (
  selectedNotes: Note[],
  onNoteDeselect: (note: Note) => void,
  removeNotes: (notes: Note[]) => void,
) => {
  const [contextMenuNote, setContextMenuNote] = useState<Note | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [internalSelectedNotes, setInternalSelectedNotes] = useState<Set<Note>>(new Set());

  // Sync internal selection state with props
  useEffect(() => {
    setInternalSelectedNotes(new Set(selectedNotes));
  }, [selectedNotes]);

  /**
   * Handles keyboard events for note deletion
   */
  const closeContextMenu = useCallback(() => {
    setContextMenuNote(null);
    setContextMenuPosition(null);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle Delete or Backspace key
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();

      if (internalSelectedNotes.size > 0) {
        const notesToDelete = Array.from(internalSelectedNotes);
        removeNotes(notesToDelete);
        setInternalSelectedNotes(new Set());
      }
    }

    // Handle Escape key to clear selection
    if (event.key === 'Escape') {
      event.preventDefault();
      setInternalSelectedNotes(new Set());
      closeContextMenu();
    }

    // Handle Ctrl+A to select all notes
    if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      setInternalSelectedNotes(new Set(selectedNotes));
    }
  }, [closeContextMenu, internalSelectedNotes, removeNotes, selectedNotes]);

  /**
   * Toggles selection state of a note
   */
  const toggleNoteSelection = useCallback((note: Note) => {
    setInternalSelectedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(note)) {
        newSet.delete(note);
      } else {
        newSet.add(note);
      }
      return newSet;
    });
  }, []);

  /**
   * Selects a single note (clears other selections)
   */
  const selectNote = useCallback((note: Note) => {
    setInternalSelectedNotes(new Set([note]));
  }, []);

  /**
   * Deselects a specific note
   */
  const deselectNote = useCallback((note: Note) => {
    setInternalSelectedNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, []);

  /**
   * Clears all note selections
   */
  const clearSelection = useCallback(() => {
    setInternalSelectedNotes(new Set());
  }, []);

  /**
   * Checks if a note is selected
   */
  const isNoteSelected = useCallback((note: Note): boolean => {
    return internalSelectedNotes.has(note);
  }, [internalSelectedNotes]);

  /**
   * Handles right-click context menu
   */
  const handleContextMenu = useCallback((event: React.MouseEvent, note: Note) => {
    event.preventDefault();
    setContextMenuNote(note);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, []);

  /**
   * Closes the context menu
   */

  /**
   * Handles context menu actions
   */
  const handleContextMenuAction = useCallback((action: 'delete' | 'select' | 'deselect' | 'cycleAccidental') => {
    if (!contextMenuNote) {
      return;
    }

    switch (action) {
      case 'delete':
        onNoteDeselect(contextMenuNote);
        setInternalSelectedNotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(contextMenuNote);
          return newSet;
        });
        break;
      case 'select':
        selectNote(contextMenuNote);
        break;
      case 'deselect':
        deselectNote(contextMenuNote);
        break;
      case 'cycleAccidental':
        // This action is handled by the parent component via onAccidentalChange
        // We just close the context menu here
        break;
    }

    closeContextMenu();
  }, [contextMenuNote, onNoteDeselect, selectNote, deselectNote, closeContextMenu]);

  /**
   * Deletes all currently selected notes
   */
  const deleteSelectedNotes = useCallback(() => {
    if (internalSelectedNotes.size > 0) {
      const notesToDelete = Array.from(internalSelectedNotes);
      removeNotes(notesToDelete);
      setInternalSelectedNotes(new Set());
    }
  }, [internalSelectedNotes, removeNotes]);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuPosition) {
        closeContextMenu();
      }
    };

    if (contextMenuPosition) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenuPosition, closeContextMenu]);

  return {
    // Selection state
    selectedNotes: Array.from(internalSelectedNotes),
    selectedNotesSet: internalSelectedNotes,

    // Selection operations
    toggleNoteSelection,
    selectNote,
    deselectNote,
    clearSelection,
    isNoteSelected,
    deleteSelectedNotes,

    // Context menu
    contextMenuNote,
    contextMenuPosition,
    handleContextMenu,
    closeContextMenu,
    handleContextMenuAction,

    // Keyboard handling
    handleKeyDown,
  };
};
