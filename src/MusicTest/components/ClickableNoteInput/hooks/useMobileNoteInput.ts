import type { Note, Octave } from '@/types/MusicTypes';
import type { ACCIDENTALS } from '@/utils/MusicConstants';
import { useCallback, useState } from 'react';
import { DEFAULT_GAME_SETTINGS, NOTE_CONFIG } from '@/config/gameConfig';
import { NOTE_CLASSES } from '@/utils/MusicConstants';
import { isTooHigh, isTooLow, noteToMidiNumber } from '@/utils/musicUtils';

export type MobileNoteInputState = {
  noteClass: typeof NOTE_CLASSES[number];
  octave: Octave;
  accidental: typeof ACCIDENTALS[number];
  isActive: boolean;
};

export const useMobileNoteInput = (
  selectedNotes: Note[],
  onNoteSelect: (note: Note) => void,
  onNoteDeselect: (note: Note) => void,
) => {
  const [inputState, setInputState] = useState<MobileNoteInputState>({
    noteClass: 'C',
    octave: DEFAULT_GAME_SETTINGS.startingOctave,
    accidental: 'natural',
    isActive: false,
  });

  // Calculate the optimal octave for the next note based on previous notes
  const calculateOptimalOctave = useCallback((noteClass: typeof NOTE_CLASSES[number]): number => {
    const lastSelectedNote: Note | undefined = selectedNotes[selectedNotes.length - 1];
    if (!lastSelectedNote) {
      return DEFAULT_GAME_SETTINGS.startingOctave;
    }

    let optimalOctave = lastSelectedNote.octave as Octave;
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
  const startNoteInput = useCallback((noteClass: typeof NOTE_CLASSES[number]) => {
    const optimalOctave = calculateOptimalOctave(noteClass);

    const newNote: Note = {
      noteClass,
      octave: optimalOctave,
      accidental: 'natural',
    };

    // Add the note to the staff immediately
    onNoteSelect(newNote);

    // Set input state to active for editing
    setInputState({
      noteClass,
      octave: optimalOctave,
      accidental: 'natural',
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
    const { noteClass, octave, accidental } = inputState;
    const oldNote = selectedNotes.find(selectedNote => filterForNote(selectedNote, { noteClass, octave, accidental }));
    const newNote = callback();

    setInputState(_ => ({
      isActive: true,
      ...newNote,
    }));

    onNoteDeselect(oldNote!);
    onNoteSelect(newNote);
  }, [inputState, onNoteDeselect, onNoteSelect, selectedNotes]);

  // Move note up by single step (C→D→E→F→G→A→B→C)
  const moveNoteUp = useCallback(() => {
    moveNote(() => {
      const currentIndex = NOTE_CLASSES.indexOf(inputState.noteClass);
      const nextIndex = (currentIndex + 1) % NOTE_CLASSES.length;
      const nextNoteClass = NOTE_CLASSES[nextIndex]!;

      // Only increment octave when crossing from B to C
      const newOctave = nextIndex === 0 ? inputState.octave + 1 : inputState.octave;

      return {
        noteClass: nextNoteClass,
        octave: newOctave,
        accidental: inputState.accidental,
      } as Note;
    });
  }, [inputState.noteClass, inputState.octave, inputState.accidental, moveNote]);

  const isNoteUpDisabled = useCallback(() => {
    if (!inputState.isActive) {
      return true;
    }
    const { noteClass, octave, accidental } = inputState;
    return isTooHigh({ noteClass, octave, accidental }, false);
  }, [inputState]);

  // Move note down by single step (C→B→A→G→F→E→D→C)
  const moveNoteDown = useCallback(() => {
    moveNote(() => {
      const currentIndex = NOTE_CLASSES.indexOf(inputState.noteClass);
      const prevIndex = currentIndex === 0 ? NOTE_CLASSES.length - 1 : currentIndex - 1;
      const prevNoteClass = NOTE_CLASSES[prevIndex]!;

      // Handle octave change when crossing C
      let newOctave = inputState.octave;
      if (currentIndex === 0) { // Wrapping from C to B
        newOctave -= 1;
      }

      return {
        noteClass: prevNoteClass,
        octave: newOctave,
        accidental: inputState.accidental,
      } as Note;
    });
  }, [inputState, moveNote]);

  const isNoteDownDisabled = useCallback(() => {
    if (!inputState.isActive) {
      return true;
    }
    const { noteClass, octave, accidental } = inputState;
    return isTooLow({ noteClass, octave, accidental }, false);
  }, [inputState]);

  // Move octave up
  const moveOctaveUp = useCallback(() => {
    moveNote(() => {
      const { noteClass, octave, accidental } = inputState;
      return {
        noteClass,
        octave: octave + 1,
        accidental,
      } as Note;
    });
  }, [inputState, moveNote]);

  const isOctaveUpDisabled = useCallback(() => {
    if (!inputState.isActive) {
      return true;
    }

    const { noteClass, accidental } = inputState;
    return isTooHigh({ noteClass, accidental, octave: inputState.octave + 1 }, true);
  }, [inputState]);

  // Move octave down
  const moveOctaveDown = useCallback(() => {
    moveNote(() => {
      const { noteClass, octave, accidental } = inputState;
      return { noteClass, octave: octave - 1, accidental } as Note;
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
    isOctaveUpDisabled,
    moveOctaveDown,
    isOctaveDownDisabled,
    changeAccidental,
    confirmNote,
    removeActiveNote,
    clearInput,
  };
};
