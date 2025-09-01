import type { Note } from '@/libs/Note';

export type MusicCallback = () => void;
export type GameCallback<T> = (arg: T) => void;

type NoteHandler = (note: Note) => void;
export type NoteHandlers = {
  select: NoteHandler;
  deselect: NoteHandler;
};
