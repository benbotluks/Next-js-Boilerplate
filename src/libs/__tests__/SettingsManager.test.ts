/**
 * Unit tests for SettingsManager
 * Tests settings persistence, validation, and error handling
 */

import type { GameSettings } from '../SettingsManager';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../SettingsManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock console.error to avoid noise in tests
const consoleErrorMock = vi.fn();

// Mock global localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock global window object
Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();

    // Update global localStorage references
    (globalThis as any).localStorage = localStorageMock;
    (globalThis.window as any).localStorage = localStorageMock;

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(consoleErrorMock);

    settingsManager = new SettingsManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Default Settings', () => {
    it('should return correct default settings', () => {
      const defaults = settingsManager.getDefaults();

      expect(defaults).toEqual({
        noteCount: 3,
        volume: 0.7,
        autoReplay: false,
      });
    });

    it('should load default settings when no stored settings exist', () => {
      const settings = settingsManager.loadSettings();

      expect(settings).toEqual({
        noteCount: 3,
        volume: 0.7,
        autoReplay: false,
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('music-test-settings');
    });
  });

  describe('Settings Persistence', () => {
    it('should save valid settings to localStorage', () => {
      const testSettings: GameSettings = {
        noteCount: 4,
        volume: 0.8,
        autoReplay: true,
      };

      const result = settingsManager.saveSettings(testSettings);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'music-test-settings',
        JSON.stringify(testSettings),
      );
    });

    it('should load saved settings from localStorage', () => {
      const testSettings: GameSettings = {
        noteCount: 5,
        volume: 0.9,
        autoReplay: true,
      };

      // Simulate stored settings
      localStorageMock.setItem('music-test-settings', JSON.stringify(testSettings));

      const loadedSettings = settingsManager.loadSettings();

      expect(loadedSettings).toEqual(testSettings);
    });

    it('should handle localStorage unavailable gracefully', () => {
      // Mock localStorage to throw error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const settings = settingsManager.loadSettings();

      expect(settings).toEqual(settingsManager.getDefaults());
    });

    it('should handle corrupted JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json{');

      const settings = settingsManager.loadSettings();

      expect(settings).toEqual(settingsManager.getDefaults());
    });
  });

  describe('Settings Validation', () => {
    it('should validate correct settings', () => {
      const validSettings: GameSettings = {
        noteCount: 4,
        volume: 0.5,
        autoReplay: true,
      };

      const result = settingsManager.validateSettings(validSettings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.correctedSettings).toEqual(validSettings);
    });

    it('should reject invalid noteCount values', () => {
      const testCases = [
        { noteCount: 1, expectedError: 'noteCount must be between 2 and 6' },
        { noteCount: 7, expectedError: 'noteCount must be between 2 and 6' },
        { noteCount: 3.5, expectedError: 'noteCount must be an integer' },
        { noteCount: 'invalid' as any, expectedError: 'noteCount must be an integer' },
      ];

      testCases.forEach(({ noteCount, expectedError }) => {
        const result = settingsManager.validateSettings({ noteCount });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
        expect(result.correctedSettings).toBeUndefined();
      });
    });

    it('should accept valid noteCount values', () => {
      const validNoteCounts = [2, 3, 4, 5, 6];

      validNoteCounts.forEach((noteCount) => {
        const result = settingsManager.validateSettings({ noteCount });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.correctedSettings?.noteCount).toBe(noteCount);
      });
    });

    it('should reject invalid volume values', () => {
      const testCases = [
        { volume: -0.1, expectedError: 'volume must be between 0 and 1' },
        { volume: 1.1, expectedError: 'volume must be between 0 and 1' },
        { volume: 'invalid' as any, expectedError: 'volume must be a number' },
      ];

      testCases.forEach(({ volume, expectedError }) => {
        const result = settingsManager.validateSettings({ volume });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      });
    });

    it('should accept valid volume values', () => {
      const validVolumes = [0, 0.5, 1, 0.25, 0.75];

      validVolumes.forEach((volume) => {
        const result = settingsManager.validateSettings({ volume });

        expect(result.isValid).toBe(true);
        expect(result.correctedSettings?.volume).toBe(volume);
      });
    });

    it('should reject invalid autoReplay values', () => {
      const invalidValues = ['true', 1, 0, null];

      invalidValues.forEach((autoReplay) => {
        const result = settingsManager.validateSettings({ autoReplay: autoReplay as any });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('autoReplay must be a boolean');
      });
    });

    it('should accept valid autoReplay values', () => {
      [true, false].forEach((autoReplay) => {
        const result = settingsManager.validateSettings({ autoReplay });

        expect(result.isValid).toBe(true);
        expect(result.correctedSettings?.autoReplay).toBe(autoReplay);
      });
    });

    it('should handle multiple validation errors', () => {
      const invalidSettings = {
        noteCount: 10,
        volume: 2,
        autoReplay: 'invalid' as any,
      };

      const result = settingsManager.validateSettings(invalidSettings);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('noteCount must be between 2 and 6');
      expect(result.errors).toContain('volume must be between 0 and 1');
      expect(result.errors).toContain('autoReplay must be a boolean');
    });

    it('should use defaults for missing properties', () => {
      const partialSettings = { noteCount: 4 };

      const result = settingsManager.validateSettings(partialSettings);

      expect(result.isValid).toBe(true);
      expect(result.correctedSettings).toEqual({
        noteCount: 4,
        volume: 0.7, // default
        autoReplay: false, // default
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset settings to defaults and clear localStorage', () => {
      // First save some custom settings
      const customSettings: GameSettings = {
        noteCount: 6,
        volume: 1.0,
        autoReplay: true,
      };
      settingsManager.saveSettings(customSettings);

      // Reset to defaults
      const resetSettings = settingsManager.resetToDefaults();

      expect(resetSettings).toEqual(settingsManager.getDefaults());
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('music-test-settings');
    });

    it('should handle localStorage errors during reset gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const resetSettings = settingsManager.resetToDefaults();

      expect(resetSettings).toEqual(settingsManager.getDefaults());
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Failed to clear settings from storage:',
        expect.any(Error),
      );
    });
  });

  describe('Storage Availability', () => {
    it('should detect when localStorage is available', () => {
      const isAvailable = settingsManager.isStorageAvailable();

      expect(isAvailable).toBe(true);
    });

    it('should detect when localStorage is not available', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const isAvailable = settingsManager.isStorageAvailable();

      expect(isAvailable).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should return false when saving invalid settings', () => {
      const invalidSettings = {
        noteCount: 10,
        volume: 2,
        autoReplay: 'invalid',
      } as any;

      const result = settingsManager.saveSettings(invalidSettings);

      expect(result).toBe(false);
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Failed to save settings:',
        expect.any(Error),
      );
    });

    it('should handle localStorage save errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage full');
      });

      const validSettings: GameSettings = {
        noteCount: 4,
        volume: 0.5,
        autoReplay: false,
      };

      const result = settingsManager.saveSettings(validSettings);

      expect(result).toBe(false);
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Failed to save settings:',
        expect.any(Error),
      );
    });

    it('should load defaults when stored settings are invalid', () => {
      const invalidStoredSettings = {
        noteCount: 10, // invalid
        volume: 2, // invalid
        autoReplay: 'yes', // invalid
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidStoredSettings));

      const settings = settingsManager.loadSettings();

      expect(settings).toEqual(settingsManager.getDefaults());
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('music-test-settings');
    });
  });
});
