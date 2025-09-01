import type { Note } from '@/libs/Note';
import type { MusicCallback } from '@/MusicTest/types/game';
import type { GameSettings } from '@/MusicTest/types/MusicTypes';
import { GAME_CONFIG } from '@/config/gameConfig';
import ClickableNoteInput from '@/MusicTest/components/noteInput';
import { Button } from '../ui/button';

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
          <Button
            onClick={replayNotes}
            disabled={isPlaying}
            children={isPlaying ? 'Playing...' : 'Replay Notes'}
          />
          <Button
            onClick={submitAnswer}
            disabled={selectedNotes.length === 0}
            children="Submit Answer"
          />
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
