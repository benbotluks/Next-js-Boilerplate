import type { Octave } from '@/types';
import type { ACCIDENTALS, NOTE_CLASS } from '@/utils/MusicConstants';
import { useCallback, useState } from 'react';
import { DEFAULT_GAME_SETTINGS, NOTE_CONFIG } from '@/config/gameConfig';
import { Note } from '@/types';
import { NOTE_CLASSES } from '@/utils/MusicConstants';
import { isTooHigh, isTooLow, noteToMidiNumber } from '@/utils/musicUtils';

export type MobileNoteInputState = {
  isActive: boolean;
  note?: Note;
};

export const useMobileNoteInput = (
  selectedNotes: Note[],
  onNoteSelect: (note: Note) => void,
  onNoteDeselect: (note: Note) => void,
) => {
  const [inputState, setInputState] = useState<MobileNoteInputState>({ isActive: false });

  // Calculate the optimal octave for the next note based on previous notes
  const calculateOptimalOctave = useCallback((noteClass: typeof NOTE_CLASSES[number]): Octave => {
    const lastSelectedNote: Note | undefined = selectedNotes[selectedNotes.length - 1];
    if (!lastSelectedNote) {
      return DEFAULT_GAME_SETTINGS.startingOctave;
    }
    let optimalOctave = lastSelectedNote.octave;
    if (NOTE_CLASSES.indexOf(noteClass) <= NOTE_CLASSES.indexOf(lastSelectedNote.noteClass)) {
      optimalOctave += 1;
    }

    // check if note is in range
    const noteMidi = noteToMidiNumber({ noteClass, octave: optimalOctave, accidental: 'natural' });
    if (noteMidi < NOTE_CONFIG.MIN_PITCH_MIDI) {
      return optimalOctave + 1;
    }
    if (noteMidi > NOTE_CONFIG.MAX_PITCH_MIDI) {
      return optimalOctave - 1;
    }

    return optimalOctave;
  }, [selectedNotes]);

  // Start building a new note
  const startNoteInput = useCallback((noteClass: NOTE_CLASS) => {
    const octave = calculateOptimalOctave(noteClass);
    const newNote = new Note({ noteClass, octave });

    onNoteSelect(newNote);
    setInputState({
      note: newNote,
      isActive: true,
    });
    console.warn('Note added to staff and input state updated');
  }, [calculateOptimalOctave, onNoteSelect]);

  const filterForNote = (selectedNote: Note, newNote: Note): boolean => {
    return (selectedNote.noteClass === newNote.noteClass && selectedNote.octave === newNote.octave && selectedNote.accidental === newNote.accidental);
  };

  const moveNote = useCallback((callback: () => Note): void => {
    if (!inputState.isActive) {
      return;
    }
    const { note } = inputState;
    const newNote = callback();

    setInputState(_ => ({
      isActive: true,
      note: newNote,
    }));

    onNoteDeselect(note);
    onNoteSelect(newNote);
  }, [inputState, onNoteDeselect, onNoteSelect]);

  // Move note up by single step (C→D→E→F→G→A→B→C)
  const moveNoteUp = useCallback(() => {
    moveNote(() => {
      return inputState.note?.moveOctave(1);
    });
  }, [inputState.note, moveNote]);

  const isNoteUpDisabled = useCallback(() => {
    const { note, isActive } = inputState;
    if (!isActive || !note) {
      return true;
    }
    return isTooHigh(note, false);
  }, [inputState]);

  // Move note down by single step (C→B→A→G→F→E→D→C)
  const moveNoteDown = useCallback(() => {
    moveNote(() => {
      return inputState.note?.moveStep(-1);
    });
  }, [inputState, moveNote]);

  const isNoteDownDisabled = useCallback(() => {
    if (!inputState.isActive || !inputState.note) {
      return true;
    }
    const { note } = inputState;
    return isTooLow(note, false);
  }, [inputState]);

  // Move octave up
  const moveOctaveUp = useCallback(() => {
    moveNote(() => {
      return inputState.note?.moveOctave(1);
    });
  }, [inputState, moveNote]);

  // Move octave down
  const moveOctaveDown = useCallback(() => {
    moveNote(() => {
      return inputState.note?.moveOctave(-1);
    });
  }, [inputState, moveNote]);

  const isOctaveDownDisabled = useCallback(() => {
    if (!inputState.isActive) {
      return true;
    }

    const { noteClass, accidental } = inputState;
    return isTooLow({ noteClass, accidental, octave: inputState.octave - 1 }, true);
  }, [inputState]);

  // Change accidental
  const changeAccidental = useCallback((accidental: typeof ACCIDENTALS[number]) => {
    if (!inputState.isActive) {
      return;
    }

    // Update the note on the staff
    const oldNote = selectedNotes.find(note => note.noteClass === inputState.noteClass);
    if (oldNote) {
      const newNote: Note = {
        ...oldNote,
        accidental,
      };

      // Replace the old note with the new one
      onNoteDeselect(oldNote);
      onNoteSelect(newNote);
    }

    setInputState(prev => ({
      ...prev,
      accidental,
    }));
  }, [inputState.isActive, inputState.noteClass, selectedNotes, onNoteSelect, onNoteDeselect]);

  // Confirm and add the note
  const confirmNote = useCallback(() => {
    if (!inputState.noteClass || !inputState.isActive) {
      return;
    }
    setInputState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, [inputState]);

  const removeActiveNote = useCallback(() => {
    const { noteClass, octave, accidental } = inputState;
    const activeNote = selectedNotes.find(selectedNote => filterForNote(selectedNote, { noteClass, octave, accidental }));

    activeNote && onNoteDeselect(activeNote);
    setInputState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, [inputState, onNoteDeselect, selectedNotes]);

  // Remove a note by clicking its note class button
  const removeNoteByClass = useCallback((noteClass: typeof NOTE_CLASSES[number]) => {
    const noteToRemove = selectedNotes.find(note => note.noteClass === noteClass);
    if (noteToRemove) {
      onNoteDeselect(noteToRemove);
    }
  }, [selectedNotes, onNoteDeselect]);

  // Clear current input
  const clearInput = useCallback(() => {
    setInputState({
      noteClass: null,
      octave: NOTE_CONFIG.DEFAULT_MIN_PITCH.octave,
      accidental: 'natural',
      isActive: false,
    });
  }, []);

  return {
    inputState,
    startNoteInput,
    moveNoteUp,
    isNoteUpDisabled,
    moveNoteDown,
    isNoteDownDisabled,
    moveOctaveUp,
    moveOctaveDown,
    isOctaveDownDisabled,
    changeAccidental,
    confirmNote,
    removeActiveNote,
    clearInput,
  };
};
