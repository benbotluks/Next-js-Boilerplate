import type { GameSettings, GameState } from '@/types/MusicTypes';

type StatsProps = {
  gameState: GameState;
  settings: GameSettings;
};

export const GameStats: React.FC<StatsProps> = ({ gameState, settings }) => {
  return (
    <div className="mb-4 flex justify-center gap-6 text-sm text-gray-600">
      <span>
        Score:
        {gameState.score}
        /
        {gameState.totalAttempts}
      </span>
      {gameState.totalAttempts > 0 && (
        <span>
          Accuracy:
          {gameState.totalAttempts > 0
            ? Math.round((gameState.score / gameState.totalAttempts) * 100)
            : 0}
          %
        </span>
      )}
      <span>
        Notes Range:
        {' '}
        {settings.minNotes}
        -
        {settings.maxNotes}
      </span>
      <span className="font-medium text-blue-600">
        Phase:
        {' '}
        {gameState.gamePhase}
      </span>
    </div>
  );
};
