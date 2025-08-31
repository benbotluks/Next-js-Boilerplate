import type { Octave } from '@/types';
import type { Accidental } from '@/types/MusicTypes';
import type { NOTE_CLASS } from '@/utils/MusicConstants';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_GAME_SETTINGS, NOTE_CONFIG } from '@/config/gameConfig';
import { Note } from '@/libs/Note';
import { NOTE_CLASSES } from '@/utils/MusicConstants';
import { noteToMidiNumber } from '@/utils/musicUtils';

export type MobileNoteInputState = {
  isActive: boolean;
  note: Note;
};

export const useMobileNoteInput = (
  selectedNotes: Note[],
  onNoteSelect: (note: Note) => void,
  onNoteDeselect: (note: Note) => void,
) => {
  const startingNote = useMemo(() => new Note({ noteClass: 'C', octave: 4 }), []);
  const [inputState, setInputState] = useState<MobileNoteInputState>({ isActive: false, note: startingNote });

  // Calculate the optimal octave for the next note based on previous notes
  const getOptimalNextNote = useCallback((noteClass: NOTE_CLASS): Note => {
    const lastSelectedNote: Note | undefined = selectedNotes[selectedNotes.length - 1];

    let optimalOctave = lastSelectedNote?.octave || DEFAULT_GAME_SETTINGS.startingOctave;
    if (lastSelectedNote && NOTE_CLASSES.indexOf(noteClass) <= NOTE_CLASSES.indexOf(lastSelectedNote.noteClass)) {
      optimalOctave += 1;
    }

    let note = new Note({ noteClass, octave: optimalOctave as Octave, accidental: 'natural' });
    const noteMidi = noteToMidiNumber(note);
    if (noteMidi < NOTE_CONFIG.MIN_PITCH_MIDI) {
      note = note.moveOctave(1) as Note;
    }
    if (noteMidi > NOTE_CONFIG.MAX_PITCH_MIDI) {
      note = note.moveOctave(-1) as Note;
    }

    return note;
  }, [selectedNotes]);

  // Start building a new note
  const startNoteInput = useCallback((noteClass: NOTE_CLASS) => {
    const newNote = getOptimalNextNote(noteClass);

    onNoteSelect(newNote);
    setInputState({
      note: newNote,
      isActive: true,
    });
    console.warn('Note added to staff and input state updated');
  }, [getOptimalNextNote, onNoteSelect]);

  const executeMovement = useCallback((movementFn: (note: Note) => Note | boolean) => {
    if (!inputState.isActive || !inputState.note) {
      return;
    }

    const result = movementFn(inputState.note);
    if (typeof result === 'boolean') {
      return;
    }

    onNoteDeselect(inputState.note);
    onNoteSelect(result);
    setInputState(prev => ({ ...prev, note: result }));
  }, [inputState.isActive, inputState.note, onNoteDeselect, onNoteSelect]);

  const moveNoteUp = useCallback(() => executeMovement(note => note.moveStep(1)), [executeMovement]);
  const moveNoteDown = useCallback(() => executeMovement(note => note.moveStep(-1)), [executeMovement]);
  const moveOctaveUp = useCallback(() => executeMovement(note => note.moveOctave(1)), [executeMovement]);
  const moveOctaveDown = useCallback(() => executeMovement(note => note.moveOctave(-1)), [executeMovement]);

  // Change accidental - follows the same pattern
  const changeAccidental = useCallback((accidental: Accidental) => {
    if (!inputState.isActive || !inputState.note) {
      return;
    }
    if (inputState.note.accidental === accidental) {
      accidental = 'natural';
    }
    const newNote = inputState.note.withAccidental(accidental);

    // Update the note on the staff
    onNoteDeselect(inputState.note);
    onNoteSelect(newNote);

    // Update local state
    setInputState(prev => ({
      ...prev,
      note: newNote,
    }));
  }, [inputState.isActive, inputState.note, onNoteDeselect, onNoteSelect]);

  // Confirm and add the note
  const confirmNote = useCallback(() => {
    if (!(inputState.note && inputState.isActive)) {
      return;
    }
    setInputState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, [inputState]);

  const removeActiveNote = useCallback(() => {
    onNoteDeselect(inputState.note);
    setInputState((_) => {
      if (selectedNotes.length > 0) {
        return { note: selectedNotes[selectedNotes.length - 1]!, isActive: true };
      }
      return {
        note: startingNote,
        isActive: false,
      };
    });
  }, [inputState.note, onNoteDeselect, selectedNotes, startingNote]);

  return {
    inputState,
    startNoteInput,
    moveNoteUp,
    moveNoteDown,
    moveOctaveUp,
    moveOctaveDown,
    changeAccidental,
    confirmNote,
    removeActiveNote,

  };
};
