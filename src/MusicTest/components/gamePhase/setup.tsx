import type { MusicCallback } from '@/MusicTest/types/game';
import type { GameSettings } from '@/types/MusicTypes';

type SetupProps = {
  settings: GameSettings;
  startNewRound: MusicCallback;
  isPlaying: boolean;
};

export const Setup: React.FC<SetupProps> = (props) => {
  const { settings, startNewRound, isPlaying } = props;
  return (
    <div className="text-center">
      <p className="mb-6 text-gray-600">
        Click "Start New Round" to begin. You'll hear between
        {' '}
        {settings.minNotes}
        {' '}
        and
        {' '}
        {settings.maxNotes}
        {' '}
        notes played simultaneously. Identify them by clicking on the staff.
      </p>
      <button
        type="button"
        onClick={startNewRound}
        disabled={isPlaying}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPlaying ? 'Loading...' : 'Start New Round'}
      </button>
    </div>
  );
};
