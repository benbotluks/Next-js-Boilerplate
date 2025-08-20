import type { AudioMode } from '@/config/gameConfig';
import type { GameSettings, GameState } from '@/types/MusicTypes';
import { AudioModeSelect } from './audioModeSelect';
import { SettingsTab } from './gameSettings';
import { GameStats } from './stats';

type DashboardProps = {
  gameState: GameState;
  settings: GameSettings;
  handleSettingsChange: (newSettings: Partial<GameSettings>) => void;
};
export const Dashboard: React.FC<DashboardProps> = ({ gameState, settings, handleSettingsChange }) => {
  return (
    <div className="mb-6 w-full">
      <h1 className="mb-4 text-center text-3xl font-bold">
        Music Note Identification
      </h1>

      {/* Game statistics */}
      <GameStats {...{ gameState, settings }} />

      {/* Always-visible audio mode selector */}
      <AudioModeSelect onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSettingsChange({ audioMode: e.target.value as AudioMode })} audioMode={settings.audioMode} />
      {gameState.gamePhase === 'setup' && <SettingsTab {...{ minNotes: settings.minNotes, maxNotes: settings.maxNotes, handleSettingsChange }} />}
    </div>
  );
};

export { GameStats, SettingsTab };
