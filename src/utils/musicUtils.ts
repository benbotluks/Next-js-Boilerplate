import type { Note } from '@/types/MusicTypes';

export const convertToVexFlowFormat = (note: Note): Note => {
  // Convert 'G4' to 'g/4'
  const match = note.match(/^([A-G][#b]?)(\d)$/);
  if (match) {
    const [, noteName, octave] = match;
    return `${noteName!.toLowerCase()}/${octave}` as Note;
  }
  return note;
};

export const convertFromVexFlowFormat = (note: Note): Note => {
  // Convert 'g/4' to 'G4'
  const match = note.match(/^([a-g][#b]?)\/(\d)$/);
  if (match) {
    const [, noteName, octave] = match;
    return `${noteName!.toUpperCase()}${octave}` as Note;
  }
  return note;
};
