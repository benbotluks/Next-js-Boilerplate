'use client';


import type { DigitalStaffProps } from '@/types/MusicTypes';
import React, { useEffect, useRef, useState } from 'react';
import VexFlow, { EasyScore, Factory, StaveNote, System } from 'vexflow';

const NOTE_NAMES: string[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
const notes = NOTE_NAMES.map((note) => {
  const staveNote = new VexFlow.StaveNote({
    clef: 'treble',
    keys: [note.toLowerCase().replace(/(\d)/, '/$1')],
    duration: 'q',
  });
  return staveNote;
});

const VexFlowStaff: React.FC<DigitalStaffProps> = ({
  maxNotes = 3,
  showCorrectAnswer = false,
  correctNotes,
  validationResult,
}) => {
  const containerRef = useRef(null);
  const [selectedNotes, setSelectedNotes] = useState<StaveNote[]>([]);
  const [score, setScore] = useState<EasyScore>()

  const toggleNote = (note: StaveNote) => {
    setSelectedNotes((prevNotes) => {
      if (prevNotes.includes(note)) {
        return prevNotes.filter(n => n !== note);
      } else if (prevNotes.length < maxNotes) {
        return [...prevNotes, note];
      } else {
        return prevNotes;
      }
    });
  };

  useEffect(() => {

    const factory = new Factory({
      renderer: {
        elementId: "vf-staff",
        width: 500,
        height: 200,
      },
    })

    const score = factory.EasyScore()
    const system = factory.System()


    system.addStave({
      voices: [
        score.voice(score.notes("C#5/q, B4, A4, G#4", { stem: "up" })),
        score.voice(score.notes("C#4/h, C#4", { stem: "down" })),
      ],
    })
      .addClef("treble")
      .addTimeSignature("4/4")

    // setSystem(() => newSystem)

    factory.draw()

    const voiceNotes = notes.map((note) => {
      if (selectedNotes.includes(note)) {
        const color = '#3b82f6'; // default blue
        // if (showCorrectAnswer && validationResult) {
        //   const colorObj = getNoteDisplayColor(note, validationResult); // your util
        //   color = colorObj.color;
        // }
        note.setStyle({ fillStyle: color, strokeStyle: color });
      }

      return note;
    });

    // Add click handlers
    voiceNotes.forEach((noteObj, idx) => {
      const el = noteObj.getAttribute('el'); // VexFlow 5.0+
      if (el) {
        el.style.cursor = 'pointer';
        el.onclick = () => toggleNote(notes[idx]);
      }
    });
  }, [selectedNotes, maxNotes, showCorrectAnswer, correctNotes, validationResult]);

  return (
    <>
      <div className="flex flex-col items-center p-4">
        <div className="mb-2 text-sm text-gray-700">
          {`Selected: ${selectedNotes.length}  / ${maxNotes}`}
        </div>
        <div id="vf-staff" ref={containerRef} className="rounded border bg-white shadow" />
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {notes.map(note => (
          <button
            key={note.keys}
            onClick={() => toggleNote(note)}
            className={`px-2 py-1 border rounded ${selectedNotes.includes(note) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {note.keys}
          </button>
        ))}
      </div>

    </>

  );
};

export default VexFlowStaff;
