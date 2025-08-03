'use client';

import type { DigitalStaffProps, Note } from '@/types/MusicTypes';
import React from 'react';
import { STAFF_POSITIONS } from '@/utils/MusicConstants';
import { getNoteDisplayColor } from '@/utils/AnswerValidation';

const DigitalStaff: React.FC<DigitalStaffProps> = ({
  selectedNotes,
  onNoteSelect,
  onNoteDeselect,
  maxNotes,
  showCorrectAnswer = false,
  correctNotes = [],
  validationResult,
}) => {
  // Staff dimensions and positioning
  const staffWidth = 400;
  const staffHeight = 200;
  const lineSpacing = 12;
  const staffStartY = 80;
  const noteRadius = 6;

  // Calculate Y position for a given line position
  const getYPosition = (linePosition: number): number => {
    return staffStartY + (8 - linePosition) * (lineSpacing / 2);
  };

  // Handle note click
  const handleNoteClick = (note: Note) => {
    if (selectedNotes.includes(note)) {
      onNoteDeselect(note);
    } else if (selectedNotes.length < maxNotes) {
      onNoteSelect(note);
    }
  };

  // Get note color based on state
  const getNoteColor = (note: Note): string => {
    if (showCorrectAnswer && validationResult) {
      // Use enhanced validation result for more detailed feedback
      const { color } = getNoteDisplayColor(note, validationResult);
      return color;
    } else if (showCorrectAnswer) {
      // Fallback to legacy logic if no validation result provided
      if (correctNotes.includes(note) && selectedNotes.includes(note)) {
        return '#22c55e'; // Green for correct
      } else if (selectedNotes.includes(note)) {
        return '#ef4444'; // Red for incorrect
      } else if (correctNotes.includes(note)) {
        return '#22c55e'; // Green for missed correct notes
      }
    }

    return selectedNotes.includes(note) ? '#3b82f6' : '#6b7280';
  };

  // Get clickable notes (reasonable range for treble clef)
  const clickableNotes: Note[] = [
    'C4',
    'D4',
    'E4',
    'F4',
    'G4',
    'A4',
    'B4',
    'C5',
    'D5',
    'E5',
    'F5',
    'G5',
    'A5',
    'B5',
  ];

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-sm text-gray-600">
        Selected:
        {' '}
        {selectedNotes.length}
        /
        {maxNotes}
        {' '}
        notes
        {selectedNotes.length >= maxNotes && (
          <span className="ml-2 text-amber-600">
            (Maximum reached - click a note to deselect)
          </span>
        )}
      </div>

      <svg
        width={staffWidth}
        height={staffHeight}
        viewBox={`0 0 ${staffWidth} ${staffHeight}`}
        className="rounded-lg border border-gray-300 bg-white"
      >
        {/* Treble clef staff lines */}
        {[0, 2, 4, 6, 8].map(linePosition => (
          <line
            key={linePosition}
            x1={40}
            y1={getYPosition(linePosition)}
            x2={staffWidth - 40}
            y2={getYPosition(linePosition)}
            stroke="#000"
            strokeWidth="1"
          />
        ))}

        {/* Treble clef symbol */}
        <text
          x={50}
          y={staffStartY + 25}
          fontSize="40"
          fontFamily="serif"
          fill="#000"
        >
          𝄞
        </text>

        {/* Ledger lines for notes that require them */}
        {clickableNotes
          .filter(note => STAFF_POSITIONS[note]?.requiresLedgerLine && selectedNotes.includes(note))
          .map((note) => {
            const position = STAFF_POSITIONS[note];
            const y = getYPosition(position.linePosition);
            const noteX = 100 + (clickableNotes.indexOf(note) * 20);

            return (
              <line
                key={`ledger-${note}`}
                x1={noteX - 15}
                y1={y}
                x2={noteX + 15}
                y2={y}
                stroke="#000"
                strokeWidth="1"
              />
            );
          })}

        {/* Clickable note positions */}
        {clickableNotes.map((note) => {
          const position = STAFF_POSITIONS[note];
          if (!position) {
            return null;
          }

          const y = getYPosition(position.linePosition);
          const x = 100 + (clickableNotes.indexOf(note) * 20);
          const isSelected = selectedNotes.includes(note);
          const canSelect = selectedNotes.length < maxNotes || isSelected;

          return (
            <g key={note}>
              {/* Clickable area */}
              <circle
                cx={x}
                cy={y}
                r={noteRadius + 4}
                fill="transparent"
                className={`cursor-pointer ${canSelect ? 'hover:fill-gray-100' : 'cursor-not-allowed'}`}
                onClick={() => canSelect && handleNoteClick(note)}
              />

              {/* Note head */}
              {isSelected && (
                <ellipse
                  cx={x}
                  cy={y}
                  rx={noteRadius}
                  ry={noteRadius - 1}
                  fill={getNoteColor(note)}
                  transform={`rotate(-20 ${x} ${y})`}
                />
              )}

              {/* Note stem */}
              {isSelected && (
                <line
                  x1={x + noteRadius - 1}
                  y1={y}
                  x2={x + noteRadius - 1}
                  y2={y - 25}
                  stroke={getNoteColor(note)}
                  strokeWidth="1.5"
                />
              )}

              {/* Accidental (sharp/flat) */}
              {isSelected && position.accidental && (
                <text
                  x={x - 15}
                  y={y + 3}
                  fontSize="12"
                  fontFamily="serif"
                  fill={getNoteColor(note)}
                >
                  {position.accidental === 'sharp' ? '♯' : '♭'}
                </text>
              )}

              {/* Note label for debugging/accessibility */}
              <text
                x={x}
                y={y + 35}
                fontSize="8"
                textAnchor="middle"
                fill="#6b7280"
                className="select-none"
              >
                {note}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Instructions */}
      <div className="mt-4 max-w-md text-center text-sm text-gray-600">
        Click on the staff positions to select notes.
        {showCorrectAnswer && validationResult && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-600" />
                <span>Incorrect</span>
              </div>
              {validationResult.missedNotes.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-amber-600" />
                  <span>Missed</span>
                </div>
              )}
            </div>
          </div>
        )}
        {showCorrectAnswer && !validationResult && (
          <div className="mt-2">
            <span className="text-green-600">Green: Correct</span>
            {' • '}
            <span className="text-red-600">Red: Incorrect</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalStaff;
