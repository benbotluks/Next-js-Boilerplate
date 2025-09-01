import type { GameSettings } from '@/libs/SettingsManager';
import React, { useState } from 'react';
import { CONFIG_HELPERS, ERROR_MESSAGES, UI_CONFIG } from '@/config/gameConfig';
import { settingsManager } from '@/libs/SettingsManager';
import { Button } from '../ui/button';
import { DualRangeSlider } from './dualRangeSlider';

export type SettingsPanelProps = {
  onSettingsChange?: (settings: GameSettings) => void;
  className?: string;
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onSettingsChange,
  className = '',
}) => {
  const [settings, setSettings] = useState<GameSettings>(settingsManager.loadSettings());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings on component mount

  // useEffect(() => {
  //   const loadedSettings = settingsManager.loadSettings();
  //   setSettings(loadedSettings);
  // }, []);

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

      {/* Note Range Selection */}
      <div className="setting-group mb-6">
        <DualRangeSlider
          min={UI_CONFIG.DUAL_RANGE_SLIDER.min}
          max={UI_CONFIG.DUAL_RANGE_SLIDER.max}
          minValue={settings.minNotes}
          maxValue={settings.maxNotes}
          step={UI_CONFIG.DUAL_RANGE_SLIDER.step}
          label={UI_CONFIG.DUAL_RANGE_SLIDER.label}
          onChange={(minNotes, maxNotes) => {
            // Update both values in a single state update
            const newSettings = { ...settings, minNotes, maxNotes };
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
          }}
          className="mb-2"
        />
        <p className="mt-2 text-xs text-gray-600">
          Choose the range of notes that will be played simultaneously (
          {settings.minNotes}
          {' '}
          to
          {' '}
          {settings.maxNotes}
          {' '}
          notes)
        </p>
      </div>

      {/* Volume Control */}
      <div className="setting-group mb-6">
        <label htmlFor="volume-slider" className="mb-2 block text-sm font-medium">
          {UI_CONFIG.VOLUME_SLIDER.label}
          :
          {' '}
          {CONFIG_HELPERS.formatVolumePercentage(settings.volume)}
        </label>
        <input
          id="volume-slider"
          type="range"
          min={UI_CONFIG.VOLUME_SLIDER.min}
          max={UI_CONFIG.VOLUME_SLIDER.max}
          step={UI_CONFIG.VOLUME_SLIDER.step}
          value={settings.volume}
          onChange={e => handleSettingChange('volume', Number.parseFloat(e.target.value))}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{CONFIG_HELPERS.formatVolumePercentage(UI_CONFIG.VOLUME_SLIDER.min)}</span>
          <span>{CONFIG_HELPERS.formatVolumePercentage(UI_CONFIG.VOLUME_SLIDER.max)}</span>
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

      {/* Accidentals Settings */}
      <div className="setting-group mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">Chromatic Notes</h4>

        <label className="mb-3 flex items-center">
          <input
            type="checkbox"
            checked={false} // This will be a session setting, not persisted
            onChange={() => {
              // This will be handled by the game controller

            }}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Include accidentals (♯/♭)</span>
        </label>

        <div className="ml-6">
          <label htmlFor="accidental-mode" className="mb-2 block text-sm font-medium text-gray-600">
            Accidental type:
          </label>
          <select
            id="accidental-mode"
            disabled={true} // Will be enabled when accidentals are turned on
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {UI_CONFIG.ACCIDENTAL_MODE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-600">
            Choose which types of accidentals to include in the game
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="setting-group mb-4">
        <Button
          onClick={handleReset}
          module="settings"
          children="Reset to Defaults"
        />
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`text-sm ${saveStatus === 'saved'
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
            ⚠️
            {' '}
            {ERROR_MESSAGES.STORAGE_NOT_AVAILABLE}
          </p>
        </div>
      )}
    </div>
  );
};
