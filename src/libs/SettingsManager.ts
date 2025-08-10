/**
 * Settings Manager for Music Note Identification Game
 * Handles user preferences and configuration persistence
 */

export type GameSettings = {
  minNotes: number;
  maxNotes: number;
  volume: number;
  autoReplay: boolean;
};

export type SettingsValidationResult = {
  isValid: boolean;
  errors: string[];
  correctedSettings?: GameSettings;
};

export class SettingsManager {
  private static readonly STORAGE_KEY = 'music-test-settings';
  private static readonly DEFAULT_SETTINGS: GameSettings = {
    minNotes: 3,
    maxNotes: 3,
    volume: 0.7,
    autoReplay: false,
  };

  /**
   * Load settings from local storage with fallback to defaults
   */
  public loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(SettingsManager.STORAGE_KEY);
      if (!stored) {
        return { ...SettingsManager.DEFAULT_SETTINGS };
      }

      const parsed = JSON.parse(stored) as Partial<GameSettings>;
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
      localStorage.setItem(SettingsManager.STORAGE_KEY, JSON.stringify(settingsToSave));
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

    // Validate minNotes and maxNotes
    if (settings.minNotes !== undefined) {
      if (typeof settings.minNotes !== 'number' || !Number.isInteger(settings.minNotes)) {
        errors.push('minNotes must be an integer');
      } else if (settings.minNotes < 1 || settings.minNotes > 8) {
        errors.push('minNotes must be between 1 and 8');
      } else {
        corrected.minNotes = settings.minNotes;
      }
    }

    if (settings.maxNotes !== undefined) {
      if (typeof settings.maxNotes !== 'number' || !Number.isInteger(settings.maxNotes)) {
        errors.push('maxNotes must be an integer');
      } else if (settings.maxNotes < 1 || settings.maxNotes > 8) {
        errors.push('maxNotes must be between 1 and 8');
      } else {
        corrected.maxNotes = settings.maxNotes;
      }
    }

    // Validate that minNotes <= maxNotes
    if (corrected.minNotes > corrected.maxNotes) {
      errors.push('Min notes must be equal to or less than max notes');
    }

    // Validate volume (0-1)
    if (settings.volume !== undefined) {
      if (typeof settings.volume !== 'number') {
        errors.push('volume must be a number');
      } else if (settings.volume < 0 || settings.volume > 1) {
        errors.push('volume must be between 0 and 1');
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
      const test = '__storage_test__';
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
