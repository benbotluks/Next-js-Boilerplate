import type { Note } from '@/types/MusicTypes';

export type MusicCallback = () => void;
export type GameCallback<T> = (arg: T) => void;

type NoteHandler = (note: Note) => void;
export type NoteHandlers = {
  select: NoteHandler;
  deselect: NoteHandler;
};
