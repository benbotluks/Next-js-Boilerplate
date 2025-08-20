import type { GameCallback } from '@/MusicTest/types/game';
import { UI_CONFIG } from '@/config/gameConfig';

type GameSettingsProps = {
  minNotes: number;
  maxNotes: number;
  handleSettingsChange: GameCallback<({ minNotes: number; maxNotes: number })>;
};

export const SettingsTab: React.FC<GameSettingsProps> = ({ minNotes, maxNotes, handleSettingsChange }) => {
  return (
    <div className="mb-4 flex flex-col items-center gap-4">
      {/* Note range selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="minNotes" className="text-sm font-medium">
            Min notes:
          </label>
          <select
            id="minNotes"
            value={minNotes}
            onChange={(e) => {
              const newMin = Number(e.target.value);
              handleSettingsChange({
                minNotes: newMin,
                maxNotes: Math.max(newMin, maxNotes),
              });
            }}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            {UI_CONFIG.DIFFICULTY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="maxNotes" className="text-sm font-medium">
            Max notes:
          </label>
          <select
            id="maxNotes"
            value={maxNotes}
            onChange={(e) => {
              const newMax = Number(e.target.value);
              handleSettingsChange({
                maxNotes: newMax,
                minNotes: Math.min(newMax, minNotes),
              });
            }}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            {UI_CONFIG.DIFFICULTY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
};
