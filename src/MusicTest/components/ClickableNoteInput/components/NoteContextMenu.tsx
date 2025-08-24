import { Note } from '@/types';
import { ACCIDENTALS, ACCIDENTALS_MAP } from '@/utils/MusicConstants';
import { setNoteAccidental } from '@/utils/musicUtils';
import React from 'react';
import { Button } from '@/MusicTest/components/ui/button';

type NoteContextMenuProps = {
  note: Note;
  position: { x: number; y: number };
  isSelected: boolean;
  onAction: (action: 'delete' | 'select' | 'deselect' | 'cycleAccidental') => void;
  onAccidentalChange: (newNote: Note) => void;
  onClose: () => void;
  showAccidentalOptions?: boolean;
};

/**
 * Context menu component for note operations
 * Provides delete, select, deselect, and accidental cycling options
 */
export const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  note,
  position,
  isSelected,
  onAction,
  onAccidentalChange,
  onClose,
  showAccidentalOptions = true,
}) => {
  const handleAction = (action: 'delete' | 'select' | 'deselect' | 'cycleAccidental') => {
    onAction(action);
    onClose();
  };

  const handleAccidentalChange = (newNote: Note) => {
    onAccidentalChange(newNote);
    onClose();
  };

  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border border-gray-300 bg-white py-1 shadow-lg"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="border-b border-gray-200 px-3 py-1 text-xs text-gray-500">
        Note: {note.noteClass}{ACCIDENTALS_MAP.natural.symbol}
      </div>

      {/* Accidental options */}
      {showAccidentalOptions && (
        <>
          <div className="border-b border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
            Accidentals
          </div>
          {ACCIDENTALS.map((variant) => {
            const isCurrentVariant = variant === note.accidental;

            return (
              <Button
                key={variant}
                module='noteInput'
                classNames={isCurrentVariant ? ['bg-blue-50, text-blue-700'] : [""]}
                onClick={() => {
                  const newNote = setNoteAccidental(note, variant)
                  return handleAccidentalChange(newNote)
                }}
                disabled={isCurrentVariant}
              >
                <span className="font-mono text-base mr-2">
                  {note.noteClass}{ACCIDENTALS_MAP[variant].symbol}
                </span>
                <span className="text-xs text-gray-500">
                  {variant.toUpperCase()}
                </span>
              </Button>
            );
          })}
        </>
      )
      }
      <div className="border-t border-gray-200 mt-1">
        <Button
          onClick={() => handleAction('delete')}
          module="noteInput"
          children="Delete Note"
        />
        <Button
          onClick={() => handleAction(isSelected ? 'select' : 'deselect')}
          module='noteInput'
          children='Deselect Note'
        />
      </div>
    </div >
  );
};
