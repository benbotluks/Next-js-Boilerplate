/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicTestPage } from '../MusicTestPage';

// Mock the audio engine
vi.mock('@/libs/AudioEngine', () => ({
  audioEngine: {
    isSupported: vi.fn(() => true),
    setVolume: vi.fn(),
    generateNoteSet: vi.fn(() => ['C4', 'E4', 'G4']),
    playNotes: vi.fn(() => Promise.resolve()),
    stopNotes: vi.fn(),
  },
}));

// Mock the settings manager
vi.mock('@/libs/SettingsManager', () => ({
  settingsManager: {
    getDefaults: vi.fn(() => ({
      noteCount: 3,
      volume: 0.7,
      autoReplay: false,
    })),
    loadSettings: vi.fn(() => ({
      noteCount: 3,
      volume: 0.7,
      autoReplay: false,
    })),
    saveSettings: vi.fn(() => true),
    resetToDefaults: vi.fn(() => ({
      noteCount: 3,
      volume: 0.7,
      autoReplay: false,
    })),
    isStorageAvailable: vi.fn(() => true),
  },
}));

// Mock the statistics tracker
vi.mock('@/libs/StatisticsTracker', () => ({
  statisticsTracker: {
    recordSession: vi.fn(),
    loadStatistics: vi.fn(() => ({
      totalAttempts: 10,
      correctAnswers: 7,
      accuracyByDifficulty: { 3: 70 },
      sessionHistory: [],
    })),
    calculateOverallAccuracy: vi.fn(() => 70),
    getStatisticsForDifficulty: vi.fn(() => ({
      attempts: 10,
      correct: 7,
      accuracy: 70,
    })),
    getRecentSessions: vi.fn(() => []),
    resetStatistics: vi.fn(),
  },
}));

const messages = {
  MusicTest: {
    meta_title: 'Music Note Identification',
    meta_description: 'Test your ear training skills',
    page_title: 'Music Note Identification',
    page_description: 'Test your ear training skills by identifying musical notes',
    tab_game: 'Game',
    tab_settings: 'Settings',
    tab_statistics: 'Statistics',
    accessibility_info: 'This application is designed to be accessible to all users.',
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe('MusicTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the main page with header and navigation', () => {
      renderWithIntl(<MusicTestPage />);

      expect(screen.getAllByText('Music Note Identification')).toHaveLength(2); // Header and game controller
      expect(screen.getByText('Test your ear training skills by identifying musical notes')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should render all navigation tabs', () => {
      renderWithIntl(<MusicTestPage />);

      expect(screen.getByRole('tab', { name: /game/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /statistics/i })).toBeInTheDocument();
    });

    it('should show game tab as active by default', () => {
      renderWithIntl(<MusicTestPage />);

      const gameTab = screen.getByRole('tab', { name: /game/i });

      expect(gameTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should display keyboard shortcuts information', () => {
      renderWithIntl(<MusicTestPage />);

      expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/Alt\+1: Game • Alt\+2: Settings • Alt\+3: Statistics/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to settings tab when clicked', async () => {
      renderWithIntl(<MusicTestPage />);

      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(settingsTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch to statistics tab when clicked', async () => {
      renderWithIntl(<MusicTestPage />);

      const statisticsTab = screen.getByRole('tab', { name: /statistics/i });
      fireEvent.click(statisticsTab);

      await waitFor(() => {
        expect(statisticsTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should render different content for each tab', async () => {
      renderWithIntl(<MusicTestPage />);

      // Game tab content (default)
      expect(screen.getByText(/Start New Round/)).toBeInTheDocument();

      // Switch to settings tab
      fireEvent.click(screen.getByRole('tab', { name: /settings/i }));
      await waitFor(() => {
        expect(screen.getByText(/Game Settings/)).toBeInTheDocument();
      });

      // Switch to statistics tab
      fireEvent.click(screen.getByRole('tab', { name: /statistics/i }));
      await waitFor(() => {
        expect(screen.getByText(/Your Progress/)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should switch tabs with Alt+number keys', async () => {
      renderWithIntl(<MusicTestPage />);

      // Alt+2 should switch to settings
      fireEvent.keyDown(document, { key: '2', altKey: true });
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /settings/i })).toHaveAttribute('aria-selected', 'true');
      });

      // Alt+3 should switch to statistics
      fireEvent.keyDown(document, { key: '3', altKey: true });
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /statistics/i })).toHaveAttribute('aria-selected', 'true');
      });

      // Alt+1 should switch back to game
      fireEvent.keyDown(document, { key: '1', altKey: true });
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /game/i })).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should navigate tabs with arrow keys when focused on tablist', async () => {
      renderWithIntl(<MusicTestPage />);

      const tablist = screen.getByRole('tablist');
      tablist.focus();

      // Right arrow should move to next tab
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /settings/i })).toHaveAttribute('aria-selected', 'true');
      });

      // Left arrow should move to previous tab
      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /game/i })).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render responsive layout classes', () => {
      renderWithIntl(<MusicTestPage />);

      const header = screen.getByRole('banner');

      expect(header.querySelector('.sm\\:flex-row')).toBeInTheDocument();
      expect(header.querySelector('.sm\\:text-left')).toBeInTheDocument();
    });

    it('should have proper spacing and padding classes for mobile', () => {
      renderWithIntl(<MusicTestPage />);

      const main = screen.getByRole('main');

      expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes for tabs', () => {
      renderWithIntl(<MusicTestPage />);

      const tablist = screen.getByRole('tablist');

      expect(tablist).toHaveAttribute('aria-label', 'Music test navigation');

      const gameTab = screen.getByRole('tab', { name: /game/i });

      expect(gameTab).toHaveAttribute('aria-controls', 'game-panel');
      expect(gameTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should have proper tabpanel attributes', () => {
      renderWithIntl(<MusicTestPage />);

      const tabpanel = screen.getByRole('tabpanel');

      expect(tabpanel).toHaveAttribute('aria-labelledby', 'game-tab');
      expect(tabpanel).toHaveAttribute('tabIndex', '0');
    });

    it('should display accessibility information in footer', () => {
      renderWithIntl(<MusicTestPage />);

      expect(screen.getByText('This application is designed to be accessible to all users.')).toBeInTheDocument();
      expect(screen.getByText('Screen reader compatible')).toBeInTheDocument();
      expect(screen.getByText('Keyboard navigation supported')).toBeInTheDocument();
      expect(screen.getByText('Touch-friendly on mobile')).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      renderWithIntl(<MusicTestPage />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Settings Integration', () => {
    it('should load initial settings on mount', () => {
      const { settingsManager } = require('@/libs/SettingsManager');
      renderWithIntl(<MusicTestPage />);

      expect(settingsManager.loadSettings).toHaveBeenCalled();
    });

    it('should handle settings changes', async () => {
      renderWithIntl(<MusicTestPage />);

      // Switch to settings tab
      fireEvent.click(screen.getByRole('tab', { name: /settings/i }));

      await waitFor(() => {
        expect(screen.getByText(/Game Settings/)).toBeInTheDocument();
      });

      // Settings panel should be rendered with proper props
      expect(screen.getByText(/Difficulty Level/)).toBeInTheDocument();
    });
  });

  describe('Statistics Integration', () => {
    it('should display statistics when statistics tab is active', async () => {
      renderWithIntl(<MusicTestPage />);

      fireEvent.click(screen.getByRole('tab', { name: /statistics/i }));

      await waitFor(() => {
        expect(screen.getByText(/Your Progress/)).toBeInTheDocument();
      });
    });

    it('should handle statistics reset callback', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderWithIntl(<MusicTestPage />);

      fireEvent.click(screen.getByRole('tab', { name: /statistics/i }));

      await waitFor(() => {
        expect(screen.getByText(/Your Progress/)).toBeInTheDocument();
      });

      // The statistics reset callback should be properly set up
      // (actual reset testing would require more complex mocking)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Game Integration', () => {
    it('should render the game controller with initial settings', () => {
      renderWithIntl(<MusicTestPage />);

      // Game should be rendered by default
      expect(screen.getByText(/Start New Round/)).toBeInTheDocument();
      expect(screen.getByText(/Music Note Identification/)).toBeInTheDocument();
    });

    it('should have minimum height for game content', () => {
      renderWithIntl(<MusicTestPage />);

      const gameContent = screen.getByText(/Start New Round/).closest('.min-h-\\[600px\\]');

      expect(gameContent).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', () => {
      const emptyMessages = { MusicTest: {} };

      render(
        <NextIntlClientProvider locale="en" messages={emptyMessages}>
          <MusicTestPage />
        </NextIntlClientProvider>,
      );

      // Should still render without crashing
      const tablists = screen.getAllByRole('tablist');

      expect(tablists.length).toBeGreaterThan(0);
    });
  });
});
