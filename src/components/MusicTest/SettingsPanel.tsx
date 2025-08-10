/**
 * Settings Panel Component for Music Note Identification Game
 * Provides UI for difficulty selection and other game preferences
 */

import type { GameSettings } from '@/libs/SettingsManager';
import React, { useEffect, useState } from 'react';
import { settingsManager } from '@/libs/SettingsManager';

export type SettingsPanelProps = {
  onSettingsChange?: (settings: GameSettings) => void;
  className?: string;
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onSettingsChange,
  className = '',
}) => {
  const [settings, setSettings] = useState<GameSettings>(settingsManager.getDefaults());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings on component mount
  useEffect(() => {
    const loadedSettings = settingsManager.loadSettings();
    setSettings(loadedSettings);
  }, []);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to storage
    setSaveStatus('saving');
    const saveSuccess = settingsManager.saveSettings(newSettings);

    if (saveSuccess) {
      setSaveStatus('saved');
      onSettingsChange?.(newSettings);

      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    const defaultSettings = settingsManager.resetToDefaults();
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const getDifficultyLabel = (noteCount: number): string => {
    const labels: Record<number, string> = {
      1: 'Perfect Pitch (1 note)',
      2: 'Beginner (2 notes)',
      3: 'Easy (3 notes)',
      4: 'Medium (4 notes)',
      5: 'Hard (5 notes)',
      6: 'Expert (6 notes)',
    };
    return labels[noteCount] || `${noteCount} notes`;
  };

  const getSaveStatusMessage = (): string => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Settings saved!';
      case 'error':
        return 'Failed to save settings';
      default:
        return '';
    }
  };

  return (
    <div className={`settings-panel ${className}`}>
      <h3 className="mb-4 text-lg font-semibold">Game Settings</h3>

      {/* Difficulty Selection */}
      <div className="setting-group mb-6">
        <label htmlFor="difficulty-select" className="mb-2 block text-sm font-medium">
          Difficulty Level
        </label>
        <select
          id="difficulty-select"
          value={settings.noteCount}
          onChange={e => handleSettingChange('noteCount', Number.parseInt(e.target.value, 10))}
          className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        >
          {[2, 3, 4, 5, 6].map(count => (
            <option key={count} value={count}>
              {getDifficultyLabel(count)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-600">
          Choose how many notes will be played simultaneously
        </p>
      </div>

      {/* Volume Control */}
      <div className="setting-group mb-6">
        <label htmlFor="volume-slider" className="mb-2 block text-sm font-medium">
          Volume:
          {' '}
          {Math.round(settings.volume * 100)}
          %
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.volume}
          onChange={e => handleSettingChange('volume', Number.parseFloat(e.target.value))}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Auto Replay Option */}
      <div className="setting-group mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.autoReplay}
            onChange={e => handleSettingChange('autoReplay', e.target.checked)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Auto-replay notes</span>
        </label>
        <p className="mt-1 ml-6 text-xs text-gray-600">
          Automatically replay notes when starting a new round
        </p>
      </div>

      {/* Reset Button */}
      <div className="setting-group mb-4">
        <button
          onClick={handleReset}
          className="rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`text-sm ${
          saveStatus === 'saved'
            ? 'text-green-600'
            : saveStatus === 'error'
              ? 'text-red-600'
              : 'text-blue-600'
        }`}
        >
          {getSaveStatusMessage()}
        </div>
      )}

      {/* Storage Warning */}
      {!settingsManager.isStorageAvailable() && (
        <div className="mt-4 rounded-md border border-yellow-400 bg-yellow-100 p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Local storage is not available. Settings will not be saved between sessions.
          </p>
        </div>
      )}
    </div>
  );
};
