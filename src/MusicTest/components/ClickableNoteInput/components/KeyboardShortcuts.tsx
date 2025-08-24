'use client';

import React, { useState } from 'react';

type KeyboardShortcutsProps = {
  className?: string;
};

/**
 * Component that displays keyboard shortcuts help
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shortcuts = [
    { key: 'Tab', description: 'Enter/exit keyboard navigation mode' },
    { key: '↑/↓', description: 'Navigate between staff positions' },
    { key: 'Enter/Space', description: 'Place note at focused position' },
    { key: 'Delete/Backspace', description: 'Remove selected notes' },
    { key: 'Escape', description: 'Exit keyboard navigation mode' },
    { key: 'Home', description: 'Go to lowest staff position' },
    { key: 'End', description: 'Go to highest staff position' },
    { key: 'C, D, E, F, G, A, B', description: 'Jump to specific note names' },
    { key: 'Ctrl/Cmd + Letter', description: 'Place note immediately' },
  ];

  return (
    <div className={`text-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="focus:ring-opacity-50 flex items-center gap-2 rounded px-2 py-1 text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-expanded={isExpanded}
        aria-controls="keyboard-shortcuts-list"
      >
        <span>Keyboard Shortcuts</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div
          id="keyboard-shortcuts-list"
          className="mt-2 rounded border bg-gray-50 p-3"
          role="region"
          aria-label="Keyboard shortcuts help"
        >
          <h4 className="mb-2 font-semibold">Available Keyboard Shortcuts:</h4>
          <dl className="space-y-1">
            {shortcuts.map(({ key, description }) => (
              <div key={key} className="flex gap-3">
                <dt className="min-w-fit rounded bg-gray-200 px-2 py-1 font-mono text-xs">
                  {key}
                </dt>
                <dd className="text-gray-700">{description}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 border-t border-gray-300 pt-2">
            <p className="text-xs text-gray-600">
              <strong>Tip:</strong>
              {' '}
              Screen reader users can navigate the staff using these keyboard shortcuts.
              The component will announce your current position and selected notes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
