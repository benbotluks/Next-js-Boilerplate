import type { ValidationResult } from '../types/StaffInteraction';
import type { Note } from '@/types/note';
import { useCallback, useMemo } from 'react';

/**
 * Hook for managing note state and operations
 * Handles adding, removing, and toggling notes with validation
 */
export const useNoteManagement = (
  selectedNotes: Note[],
  onNoteSelect: (note: Note) => void,
  onNoteDeselect: (note: Note) => void,
  handleAudioPlayback: (note?: Note) => void,
  maxNotes: number,
  limitNotes: boolean,
) => {
  /**
   * Validates if a note can be added
   */
  const validateNoteAddition = useCallback((note: Note): ValidationResult => {
    // Check if note already exists
    if (selectedNotes.includes(note)) {
      return { valid: false, error: 'Note already exists' };
    }

    // Check maximum note limit only if limitNotes is true
    if (limitNotes && selectedNotes.length >= maxNotes) {
      return { valid: false, error: 'Maximum notes reached' };
    }

    return { valid: true };
  }, [selectedNotes, maxNotes, limitNotes]);

  /**
   * Adds a note if validation passes
   */
  const addNote = useCallback((note: Note): boolean => {
    const validation = validateNoteAddition(note);
    if (validation.valid) {
      onNoteSelect(note);
      return true;
    }
    return false;
  }, [validateNoteAddition, onNoteSelect]);

  /**
   * Removes a note if it exists
   */
  const removeNote = useCallback((note: Note): boolean => {
    if (selectedNotes.includes(note)) {
      onNoteDeselect(note);
      return true;
    }
    return false;
  }, [selectedNotes, onNoteDeselect]);

  /**
   * Toggles a note (adds if not present, removes if present)
   */

  const toggleNote = useCallback((note: Note): boolean => {
    let success: boolean;
    if (selectedNotes.includes(note)) {
      success = removeNote(note);
      // handleAudioPlayback(undefined);
    } else {
      success = addNote(note);
      // handleAudioPlayback(note);
    }
    return success;
  }, [selectedNotes, addNote, removeNote, handleAudioPlayback]);

  /**
   * Checks if a new note can be added
   */
  const canAddNote = useCallback((note?: Note): boolean => {
    if (note) {
      return validateNoteAddition(note).valid;
    }
    // If limitNotes is false, we can always add more notes
    return !limitNotes || selectedNotes.length < maxNotes;
  }, [validateNoteAddition, selectedNotes.length, maxNotes, limitNotes]);

  /**
   * Checks if a note is currently selected
   */
  const isNoteSelected = useCallback((note: Note): boolean => {
    return selectedNotes.includes(note);
  }, [selectedNotes]);

  /**
   * Gets the current note count
   */
  const noteCount = useMemo(() => selectedNotes.length, [selectedNotes.length]);

  /**
   * Gets remaining note slots
   */
  const remainingSlots = useMemo(() => maxNotes - selectedNotes.length, [maxNotes, selectedNotes.length]);

  /**
   * Clears all selected notes
   */
  const clearAllNotes = useCallback(() => {
    selectedNotes.forEach(note => onNoteDeselect(note));
  }, [selectedNotes, onNoteDeselect]);

  /**
   * Removes multiple notes at once
   */
  const removeNotes = useCallback((notes: Note[]) => {
    notes.forEach((note) => {
      if (selectedNotes.includes(note)) {
        onNoteDeselect(note);
      }
    });
  }, [selectedNotes, onNoteDeselect]);

  return {
    // Core operations
    addNote,
    removeNote,
    toggleNote,
    clearAllNotes,
    removeNotes,

    // Validation and state checks
    canAddNote,
    isNoteSelected,
    validateNoteAddition,

    // State information
    noteCount,
    remainingSlots,
    selectedNotes: selectedNotes as readonly Note[],
  };
};
