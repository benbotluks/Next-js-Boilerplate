import type { Note } from '@/types/';
import { ACCIDENTALS, ACCIDENTALS_MAP, NOTE_CLASSES } from '@/utils/MusicConstants';
import { useMobileNoteInput } from '../hooks/useMobileNoteInput';

type MobileNoteInputProps = {
  selectedNotes: Note[];
  onNoteSelect: (note: Note) => void;
  onNoteDeselect: (note: Note) => void;
  disabled?: boolean;
  className?: string;
};

export const MobileNoteInput: React.FC<MobileNoteInputProps> = ({
  selectedNotes,
  onNoteSelect,
  onNoteDeselect,
  disabled = false,
  className = '',
}) => {
  const {
    inputState,
    startNoteInput,
    moveNoteUp,
    isNoteUpDisabled,
    moveNoteDown,
    isNoteDownDisabled,
    moveOctaveUp,
    moveOctaveDown,
    changeAccidental,
    confirmNote,
    removeActiveNote,
    clearInput,
  } = useMobileNoteInput(selectedNotes, onNoteSelect, onNoteDeselect);

  // Check if a note class is currently being built
  const isNoteClassActive = (noteClass: typeof NOTE_CLASSES[number]): boolean => {
    return Boolean(inputState.isActive && inputState.note?.noteClass === noteClass);
  };

  const isAccidentalActive = (accidental: typeof ACCIDENTALS[number]): boolean => {
    return inputState.isActive && (inputState.note?.accidental === accidental);
  };

  return (
    <div className={className}>
      {/* Compact Current Note Display */}
      {inputState.isActive && (
        <div className="mb-3 rounded-lg border bg-blue-50 p-2 text-center">
          <div className="text-sm font-semibold text-blue-800">
            {inputState.note?.displayFormat}
          </div>
        </div>
      )}

      {/* Note Class Buttons - Compact Grid */}
      <div className="mb-3">
        <div className="grid grid-cols-7 gap-1">
          {NOTE_CLASSES.map((noteClass) => {
            const isActive = isNoteClassActive(noteClass);

            return (
              <button
                key={noteClass}
                type="button"
                onClick={() => {
                  if (inputState.isActive) {
                    removeActiveNote();
                  }
                  if (!isActive) {
                    startNoteInput(noteClass);
                  }
                }}
                disabled={disabled}
                className={`
                  flex h-10 w-full items-center justify-center rounded border-2 text-sm font-bold text-white transition-all
                  ${isActive
                  && 'border-blue-500 bg-blue-500 shadow-lg'
              }
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {noteClass}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Controls Row - Only show when active */}
      {inputState.isActive && inputState.note && (
        <div className="space-y-2">
          {/* Movement and Octave Controls - Horizontal */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={moveNoteDown}
              disabled={!inputState.note.moveStep(-1)}
              className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => inputState.note?.moveStep(1)}
              disabled={!inputState.note.moveStep(1)}
              className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={moveOctaveDown}
              disabled={!inputState.note.moveOctave(-1)}
              className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600 disabled:opacity-50"
            >
              ▼▼
            </button>
            <button
              type="button"
              onClick={moveOctaveUp}
              disabled={!inputState.note.moveOctave(1)}
              className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600 disabled:opacity-50"
            >
              ▲▲
            </button>
          </div>

          {/* Accidental Controls - Horizontal */}
          <div className="flex justify-center gap-2">
            {ACCIDENTALS.map(accidental => (
              <button
                key={accidental}
                type="button"
                onClick={() => changeAccidental(accidental)}
                disabled={!inputState.isActive}
                className={`
                  rounded px-3 py-1 text-xs font-bold text-white transition-all
                  ${isAccidentalActive(accidental)
                ? 'bg-orange-500 shadow-lg'
                : 'bg-orange-400 hover:bg-orange-500'
              }
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {ACCIDENTALS_MAP[accidental].symbol}
              </button>
            ))}
          </div>

          {/* Action Buttons - Horizontal */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                console.warn('OK button clicked, inputState:', inputState);
                confirmNote();
              }}
              disabled={!inputState.isActive}
              className="rounded bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50"
            >
              ✓ OK
            </button>
            <button
              type="button"
              onClick={clearInput}
              disabled={disabled}
              className="rounded bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
            >
              ✗ Clear
            </button>
          </div>
        </div>
      )}

      {/* Compact Instructions */}
      <div className="mt-2 text-center text-xs text-gray-500">
        {inputState.isActive
          ? 'Adjust note, then OK'
          : 'Click note class to start'}
      </div>
    </div>
  );
};
