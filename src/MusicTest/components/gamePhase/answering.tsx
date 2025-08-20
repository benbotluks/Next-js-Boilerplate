import type { MusicCallback } from '@/MusicTest/types/game';
import type { GameSettings, Note } from '@/types/MusicTypes';
import { GAME_CONFIG } from '@/config/gameConfig';
import ClickableNoteInput from '@/MusicTest/ClickableNoteInput';

type AnsweringProps = {
  settings: GameSettings;
  noteHandlers: any;
  isPlaying: boolean;
  replayNotes: MusicCallback;
  submitAnswer: MusicCallback;
  selectedNotes: Note[];
  currentNotes: Note[];
  limitNotes: boolean;

};

export const Answering: React.FC<AnsweringProps> = ({ selectedNotes, currentNotes, limitNotes, settings, noteHandlers, isPlaying, replayNotes, submitAnswer }) => {
  return (
    <div>
      <div className="mb-6 text-center">
        <p className="mb-4 text-gray-600">
          Select the notes you heard by clicking on the staff.
          <br />
          <span className="text-sm text-gray-500">
            Tip: You can change the note playback mode above at any time.
          </span>
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={replayNotes}
            disabled={isPlaying}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isPlaying ? 'Playing...' : 'Replay Notes'}
          </button>
          <button
            type="button"
            onClick={submitAnswer}
            disabled={selectedNotes.length === 0}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Answer
          </button>
        </div>
      </div>

      <ClickableNoteInput
        selectedNotes={selectedNotes}
        onNoteSelect={noteHandlers.select}
        onNoteDeselect={noteHandlers.deselect}
        maxNotes={currentNotes.length}
        limitNotes={limitNotes}
        enableAudio={true}
        audioMode={settings.audioMode}
        width={GAME_CONFIG.STAFF_WIDTH}
        height={GAME_CONFIG.STAFF_HEIGHT}
        respectGamePhase={false}
      />
    </div>
  );
};
