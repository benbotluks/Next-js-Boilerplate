import type { MusicCallback } from '@/MusicTest/types/game';
import type { Note } from '@/types/MusicTypes';
import type { ValidationResult } from '@/utils/AnswerValidation';
import { GAME_CONFIG } from '@/config/gameConfig';
import ClickableNoteInput from '@/MusicTest/components/ClickableNoteInput';

type ValidationProps = {
  validationResult: ValidationResult;
  selectedNotes: Note[];
  currentNotes: Note[];
  isPlaying: boolean;
  startNewRound: MusicCallback;
  resetGame: MusicCallback;
  replayNotes: MusicCallback;
};

export const Validation: React.FC<ValidationProps> = ({ validationResult, selectedNotes, currentNotes, isPlaying, startNewRound, resetGame, replayNotes }) => {
  return (
    <div>
      {/* Show comparison between user answer and correct answer */}
      <div className="mb-6">
        <h3 className="mb-6 text-center text-xl font-semibold">
          {validationResult.isCorrect ? '✅ Correct Answer!' : '📝 Compare Your Answer'}
        </h3>

        {/* Legend */}
        <div className="mb-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Your Answer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-600"></div>
            <span>Correct Answer</span>
          </div>
        </div>

        <ClickableNoteInput
          selectedNotes={selectedNotes}
          onNoteSelect={() => { }} // Read-only
          onNoteDeselect={() => { }} // Read-only
          maxNotes={Math.max(selectedNotes.length, currentNotes.length)}
          limitNotes={false}
          showCorrectAnswer={true}
          correctNotes={currentNotes}
          validationResult={validationResult}
          disabled={true}
          enableAudio={true}
          audioMode="poly"
          width={GAME_CONFIG.STAFF_WIDTH * 1.5}
          height={GAME_CONFIG.STAFF_HEIGHT}
        />

        <div className="mt-2 flex justify-center gap-8 text-sm text-gray-600">
          <span>
            Your:
            {' '}
            {selectedNotes.length}
            {' '}
            note
            {selectedNotes.length !== 1 ? 's' : ''}
          </span>
          <span>
            Correct:
            {' '}
            {currentNotes.length}
            {' '}
            note
            {currentNotes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Compact feedback controls */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={replayNotes}
          disabled={isPlaying}
          className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPlaying ? 'Playing...' : '🔊 Replay Notes'}
        </button>
        <button
          type="button"
          onClick={startNewRound}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          ➡️ Next Round
        </button>
        <button
          type="button"
          onClick={resetGame}
          className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          🔄 Reset Game
        </button>
      </div>
    </div>
  );
};
