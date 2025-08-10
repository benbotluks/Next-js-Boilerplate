/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import type { Note } from '@/types/MusicTypes';
import React from 'react';

type NoteContextMenuProps = {
  note: Note;
  position: { x: number; y: number };
  isSelected: boolean;
  onAction: (action: 'delete' | 'select' | 'deselect') => void;
  onClose: () => void;
};

/**
 * Context menu component for note operations
 * Provides delete, select, and deselect options
 */
export const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  note,
  position,
  isSelected,
  onAction,
  onClose,
}) => {
  const handleAction = (action: 'delete' | 'select' | 'deselect') => {
    onAction(action);
    onClose();
  };

  return (
    <div
      className="fixed z-50 min-w-32 rounded-md border border-gray-300 bg-white py-1 shadow-lg"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="border-b border-gray-200 px-3 py-1 text-xs text-gray-500">
        Note:
        {' '}
        {note.toUpperCase()}
      </div>

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
  );
};
