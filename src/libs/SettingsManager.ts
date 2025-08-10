/**
 * Settings Manager for Music Note Identification Game
 * Handles user preferences and configuration persistence
 */

import {
  CONFIG_HELPERS,
  DEFAULT_GAME_SETTINGS,
  ERROR_MESSAGES,
  STORAGE_CONFIG,
  VALIDATION_CONFIG,
} from '@/config/gameConfig';

export type GameSettings = {
  minNotes: number;
  maxNotes: number;
  volume: number;
  autoReplay: boolean;
};

type StoredSettings = GameSettings & {
  version?: string;
};

export type SettingsValidationResult = {
  isValid: boolean;
  errors: string[];
  correctedSettings?: GameSettings;
};

export class SettingsManager {
  private static readonly STORAGE_KEY = STORAGE_CONFIG.SETTINGS_KEY;
  private static readonly DEFAULT_SETTINGS: GameSettings = DEFAULT_GAME_SETTINGS;

  /**
   * Load settings from local storage with fallback to defaults
   */
  public loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(SettingsManager.STORAGE_KEY);
      if (!stored) {
        return { ...SettingsManager.DEFAULT_SETTINGS };
      }

      const parsed = JSON.parse(stored) as Partial<StoredSettings>;

      // Check version compatibility
      if (parsed.version !== STORAGE_CONFIG.SETTINGS_VERSION) {
        // Settings are from an older version, use defaults and update storage
        const newSettings = { ...SettingsManager.DEFAULT_SETTINGS };
        this.saveSettings(newSettings);
        return newSettings;
      }

      const validation = this.validateSettings(parsed);

      if (validation.isValid && validation.correctedSettings) {
        return validation.correctedSettings;
      }

      // If validation failed, return defaults and clear invalid data
      localStorage.removeItem(SettingsManager.STORAGE_KEY);
      return { ...SettingsManager.DEFAULT_SETTINGS };
    } catch (error) {
      // If localStorage is unavailable or JSON parsing fails, return defaults
      console.error('Error loading settings: ', error);
      return { ...SettingsManager.DEFAULT_SETTINGS };
    }
  }

  /**
   * Save settings to local storage
   */
  public saveSettings(settings: GameSettings): boolean {
    try {
      const validation = this.validateSettings(settings);
      if (!validation.isValid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
      }

      const settingsToSave = validation.correctedSettings || settings;
      const storedSettings: StoredSettings = {
        ...settingsToSave,
        version: STORAGE_CONFIG.SETTINGS_VERSION,
      };

      localStorage.setItem(SettingsManager.STORAGE_KEY, JSON.stringify(storedSettings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Reset settings to default values
   */
  public resetToDefaults(): GameSettings {
    try {
      localStorage.removeItem(SettingsManager.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear settings from storage:', error);
    }
    return { ...SettingsManager.DEFAULT_SETTINGS };
  }

  /**
   * Validate settings and provide corrected values if needed
   */
  public validateSettings(settings: Partial<GameSettings>): SettingsValidationResult {
    const errors: string[] = [];
    const corrected: GameSettings = { ...SettingsManager.DEFAULT_SETTINGS };

    // Validate minNotes
    if (settings.minNotes !== undefined) {
      if (typeof settings.minNotes !== 'number' || !Number.isInteger(settings.minNotes)) {
        errors.push('minNotes must be an integer');
      } else if (!CONFIG_HELPERS.isValidNoteCount(settings.minNotes)) {
        errors.push(ERROR_MESSAGES.INVALID_NOTE_COUNT(VALIDATION_CONFIG.NOTE_COUNT.min, VALIDATION_CONFIG.NOTE_COUNT.max));
      } else {
        corrected.minNotes = settings.minNotes;
      }
    }

    // Validate maxNotes
    if (settings.maxNotes !== undefined) {
      if (typeof settings.maxNotes !== 'number' || !Number.isInteger(settings.maxNotes)) {
        errors.push('maxNotes must be an integer');
      } else if (!CONFIG_HELPERS.isValidNoteCount(settings.maxNotes)) {
        errors.push(ERROR_MESSAGES.INVALID_NOTE_COUNT(VALIDATION_CONFIG.NOTE_COUNT.min, VALIDATION_CONFIG.NOTE_COUNT.max));
      } else {
        corrected.maxNotes = settings.maxNotes;
      }
    }

    // Validate note range relationship
    if (!CONFIG_HELPERS.isValidNoteRange(corrected.minNotes, corrected.maxNotes)) {
      errors.push(ERROR_MESSAGES.MIN_GREATER_THAN_MAX);
    }

    // Validate volume
    if (settings.volume !== undefined) {
      if (typeof settings.volume !== 'number') {
        errors.push('volume must be a number');
      } else if (!CONFIG_HELPERS.isValidVolume(settings.volume)) {
        errors.push(ERROR_MESSAGES.INVALID_VOLUME(VALIDATION_CONFIG.VOLUME.min, VALIDATION_CONFIG.VOLUME.max));
      } else {
        corrected.volume = settings.volume;
      }
    }

    // Validate autoReplay
    if (settings.autoReplay !== undefined) {
      if (typeof settings.autoReplay !== 'boolean') {
        errors.push('autoReplay must be a boolean');
      } else {
        corrected.autoReplay = settings.autoReplay;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      correctedSettings: errors.length === 0 ? corrected : undefined,
    };
  }

  /**
   * Get default settings
   */
  public getDefaults(): GameSettings {
    return { ...SettingsManager.DEFAULT_SETTINGS };
  }

  /**
   * Check if local storage is available
   */
  public isStorageAvailable(): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }
      const test = STORAGE_CONFIG.STORAGE_TEST_KEY;
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const settingsManager = new SettingsManager();
