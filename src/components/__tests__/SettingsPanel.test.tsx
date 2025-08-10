/**
 * Unit tests for SettingsPanel component
 * Tests UI interactions, settings persistence, and validation
 */

import type { GameSettings } from '@/libs/SettingsManager';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Import the mocked settingsManager
import { settingsManager } from '@/libs/SettingsManager';

import { SettingsPanel } from '../MusicTest/SettingsPanel';

// Mock the SettingsManager module
vi.mock('@/libs/SettingsManager', () => {
  return {
    settingsManager: {
      loadSettings: vi.fn(),
      saveSettings: vi.fn(),
      resetToDefaults: vi.fn(),
      getDefaults: vi.fn(),
      isStorageAvailable: vi.fn(),
    },
    GameSettings: {} as any,
  };
});
const mockSettingsManager = vi.mocked(settingsManager);

describe('SettingsPanel', () => {
  const defaultSettings: GameSettings = {
    noteCount: 3,
    volume: 0.7,
    autoReplay: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsManager.getDefaults.mockReturnValue(defaultSettings);
    mockSettingsManager.loadSettings.mockReturnValue(defaultSettings);
    mockSettingsManager.saveSettings.mockReturnValue(true);
    mockSettingsManager.isStorageAvailable.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all settings controls', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Game Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Difficulty Level')).toBeInTheDocument();
      expect(screen.getByLabelText(/Volume:/)).toBeInTheDocument();
      expect(screen.getByLabelText('Auto-replay notes')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    it('should load and display initial settings', () => {
      const customSettings: GameSettings = {
        noteCount: 5,
        volume: 0.9,
        autoReplay: true,
      };
      mockSettingsManager.loadSettings.mockReturnValue(customSettings);

      render(<SettingsPanel />);

      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0.9')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should apply custom className', () => {
      const { container } = render(<SettingsPanel className="custom-class" />);

      expect(container.firstChild).toHaveClass('settings-panel', 'custom-class');
    });
  });

  describe('Difficulty Selection', () => {
    it('should display all difficulty options', () => {
      render(<SettingsPanel />);

      const select = screen.getByLabelText('Difficulty Level');
      const options = select.querySelectorAll('option');

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveTextContent('Beginner (2 notes)');
      expect(options[1]).toHaveTextContent('Easy (3 notes)');
      expect(options[2]).toHaveTextContent('Medium (4 notes)');
      expect(options[3]).toHaveTextContent('Hard (5 notes)');
      expect(options[4]).toHaveTextContent('Expert (6 notes)');
    });

    it('should update noteCount when difficulty is changed', async () => {
      const onSettingsChange = vi.fn();
      render(<SettingsPanel onSettingsChange={onSettingsChange} />);

      const select = screen.getByLabelText('Difficulty Level');
      fireEvent.change(select, { target: { value: '5' } });

      expect(mockSettingsManager.saveSettings).toHaveBeenCalledWith({
        ...defaultSettings,
        noteCount: 5,
      });

      await waitFor(() => {
        expect(onSettingsChange).toHaveBeenCalledWith({
          ...defaultSettings,
          noteCount: 5,
        });
      });
    });
  });

  describe('Volume Control', () => {
    it('should display current volume percentage', () => {
      const customSettings: GameSettings = {
        ...defaultSettings,
        volume: 0.8,
      };
      mockSettingsManager.loadSettings.mockReturnValue(customSettings);

      render(<SettingsPanel />);

      expect(screen.getByText('Volume: 80%')).toBeInTheDocument();
    });

    it('should update volume when slider is changed', async () => {
      const onSettingsChange = vi.fn();
      render(<SettingsPanel onSettingsChange={onSettingsChange} />);

      const slider = screen.getByLabelText(/Volume:/);
      fireEvent.change(slider, { target: { value: '0.9' } });

      expect(mockSettingsManager.saveSettings).toHaveBeenCalledWith({
        ...defaultSettings,
        volume: 0.9,
      });

      await waitFor(() => {
        expect(onSettingsChange).toHaveBeenCalledWith({
          ...defaultSettings,
          volume: 0.9,
        });
      });
    });
  });

  describe('Auto-Replay Setting', () => {
    it('should toggle autoReplay when checkbox is clicked', async () => {
      const onSettingsChange = vi.fn();
      render(<SettingsPanel onSettingsChange={onSettingsChange} />);

      const checkbox = screen.getByLabelText('Auto-replay notes');
      fireEvent.click(checkbox);

      expect(mockSettingsManager.saveSettings).toHaveBeenCalledWith({
        ...defaultSettings,
        autoReplay: true,
      });

      await waitFor(() => {
        expect(onSettingsChange).toHaveBeenCalledWith({
          ...defaultSettings,
          autoReplay: true,
        });
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to defaults when reset button is clicked', async () => {
      const resetSettings: GameSettings = {
        noteCount: 3,
        volume: 0.7,
        autoReplay: false,
      };
      mockSettingsManager.resetToDefaults.mockReturnValue(resetSettings);

      const onSettingsChange = vi.fn();
      render(<SettingsPanel onSettingsChange={onSettingsChange} />);

      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);

      expect(mockSettingsManager.resetToDefaults).toHaveBeenCalled();

      await waitFor(() => {
        expect(onSettingsChange).toHaveBeenCalledWith(resetSettings);
      });
    });
  });

  describe('Storage Availability Warning', () => {
    it('should show warning when localStorage is not available', () => {
      mockSettingsManager.isStorageAvailable.mockReturnValue(false);

      render(<SettingsPanel />);

      expect(screen.getByText(/Local storage is not available/)).toBeInTheDocument();
    });

    it('should not show warning when localStorage is available', () => {
      mockSettingsManager.isStorageAvailable.mockReturnValue(true);

      render(<SettingsPanel />);

      expect(screen.queryByText(/Local storage is not available/)).not.toBeInTheDocument();
    });
  });
});
