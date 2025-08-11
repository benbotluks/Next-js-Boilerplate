/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import type { Note } from '@/types/MusicTypes';
import { detectAccidental, getAccidentalVariations, getNaturalNote } from '@/utils/musicUtils';
import React from 'react';

type NoteContextMenuProps = {
  note: Note;
  position: { x: number; y: number };
  isSelected: boolean;
  onAction: (action: 'delete' | 'select' | 'deselect' | 'cycleAccidental') => void;
  onAccidentalChange?: (newNote: Note) => void;
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
    onAccidentalChange?.(newNote);
    onClose();
  };

  const naturalNote = getNaturalNote(note);
  const currentAccidental = detectAccidental(note);
  const accidentalVariations = getAccidentalVariations(note);
  const hasAccidentals = accidentalVariations.length > 1;

  const getAccidentalLabel = (accidental: 'natural' | 'sharp' | 'flat') => {
    switch (accidental) {
      case 'natural': return '♮';
      case 'sharp': return '♯';
      case 'flat': return '♭';
    }
  };

  const getAccidentalName = (accidental: 'natural' | 'sharp' | 'flat') => {
    switch (accidental) {
      case 'natural': return 'Natural';
      case 'sharp': return 'Sharp';
      case 'flat': return 'Flat';
    }
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
        Note: {naturalNote}{getAccidentalLabel(currentAccidental)}
      </div>

      {/* Accidental options */}
      {showAccidentalOptions && hasAccidentals && (
        <>
          <div className="border-b border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
            Accidentals
          </div>
          {accidentalVariations.map((variation) => {
            const variantAccidental = detectAccidental(variation);
            const isCurrentVariant = variation === note;
            
            return (
              <button
                key={variation}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  isCurrentVariant ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleAccidentalChange(variation)}
                disabled={isCurrentVariant}
              >
                <span className="font-mono text-base mr-2">
                  {naturalNote}{getAccidentalLabel(variantAccidental)}
                </span>
                <span className="text-xs text-gray-500">
                  {getAccidentalName(variantAccidental)}
                </span>
              </button>
            );
          })}
        </>
      )}

      {/* Standard actions */}
      <div className="border-t border-gray-200 mt-1">
        <button
          type="button"
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          onClick={() => handleAction('delete')}
        >
          Delete Note
        </button>

        {!isSelected
          ? (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleAction('select')}
              >
                Select Note
              </button>
            )
          : (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleAction('deselect')}
              >
                Deselect Note
              </button>
            )}
      </div>
    </div>
  );
};
