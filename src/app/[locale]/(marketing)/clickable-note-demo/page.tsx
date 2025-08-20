'use client';

import type { Note } from '@/types/MusicTypes';
import { useState } from 'react';
import ClickableNoteInput from '@/MusicTest/ClickableNoteInput';
import { toDisplayFormat } from '@/utils/musicUtils';

export default function ClickableNoteDemoPage() {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [audioMode, setAudioMode] = useState<'mono' | 'poly'>('mono');

  const correctNotes: Note[] = ['C', 'E', 'G'].map((noteClass) => {
    return { noteClass, octave: 4, accidental: 'natural' } as Note;
  });

  const handleNoteSelect = (note: Note) => {
    setSelectedNotes(prev => [...prev, note]);
  };

  const handleNoteDeselect = (note: Note) => {
    setSelectedNotes(prev => prev.filter(n => n !== note));
  };

  const handleClear = () => {
    setSelectedNotes([]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Clickable Note Input Demo</h1>

      <div className="mb-6">
        <ClickableNoteInput
          selectedNotes={selectedNotes}
          onNoteSelect={handleNoteSelect}
          onNoteDeselect={handleNoteDeselect}
          maxNotes={5}
          limitNotes={false}
          showCorrectAnswer={showCorrectAnswer}
          correctNotes={correctNotes}
          width={400}
          height={250}
          enableAudio={true}
          audioMode={audioMode}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleClear}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Clear All Notes
        </button>

        <button
          type="button"
          onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {showCorrectAnswer ? 'Hide' : 'Show'}
          {' '}
          Correct Answer
        </button>

        <button
          type="button"
          onClick={() => setSelectedNotes(correctNotes)}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Set C Major Chord
        </button>
        {/*
        <button
          type="button"
          onClick={() => setSelectedNotes(['c/4', 'e/4', 'g#/4'])}
          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
        >
          Set C Major with G# (Chromatic)
        </button> */}

        <button
          type="button"
          onClick={() => setAudioMode(audioMode === 'mono' ? 'poly' : 'mono')}
          className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          Audio:
          {' '}
          {audioMode === 'mono' ? 'Monophonic' : 'Polyphonic'}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">Instructions:</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Click on staff lines or spaces to add notes</li>
          <li>Click on existing notes to remove them</li>
          <li><strong>Right-click on notes to change accidentals (♮, ♯, ♭)</strong></li>
          <li>Hover over the staff to see note previews</li>
          <li>Use Tab and arrow keys for keyboard navigation</li>
          <li>Notes will play audio when added (individual mode) or as chords (chord mode)</li>
          <li>Click the "🔊 Play Notes" button to replay all selected notes</li>
          <li>Maximum 5 notes can be selected</li>
          <li>Use the buttons above to test different features</li>
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">Selected Notes:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedNotes.length === 0
            ? (
                <span className="text-gray-500">No notes selected</span>
              )
            : (
                selectedNotes.map((note, index) => (
                  <span
                    key={`${note}-${index}`}
                    className="rounded bg-blue-100 px-2 py-1 text-blue-800"
                  >
                    {toDisplayFormat(note)}
                  </span>
                ))
              )}
        </div>
      </div>
    </div>
  );
}
