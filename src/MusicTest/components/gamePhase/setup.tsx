import type { MusicCallback } from '@/MusicTest/types/game';
import type { GameSettings } from '@/types/MusicTypes';
import { Button } from '../ui/button';

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
      <Button
        onClick={startNewRound}
        disabled={isPlaying}
        children={isPlaying ? 'Loading...' : 'Start New Round'}
      />
    </div>
  );
};
