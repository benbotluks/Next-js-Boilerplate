import type { AudioMode } from '@/config/gameConfig';
import { UI_CONFIG } from '@/config/gameConfig';

type AudioModeProps = {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  audioMode: AudioMode;
};

export const AudioModeSelect: React.FC<AudioModeProps> = ({ onChange, audioMode }) => {
  return (
    <div className="mb-4 flex justify-center">
      <div className="flex items-center gap-2">
        <label htmlFor="audioMode" className="text-sm font-medium">
          Note playback:
        </label>
        <select
          id="audioMode"
          value={audioMode}
          onChange={onChange}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm"
        >
          {UI_CONFIG.AUDIO_MODE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
