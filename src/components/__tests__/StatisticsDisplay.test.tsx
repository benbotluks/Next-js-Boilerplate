/**
 * Unit tests for StatisticsDisplay component
 */

import type { Note, SessionResult, UserStatistics } from '@/types/MusicTypes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { statisticsTracker } from '@/libs/StatisticsTracker';
import { StatisticsDisplay } from '../StatisticsDisplay';

// Mock the StatisticsTracker
vi.mock('@/libs/StatisticsTracker', () => ({
  statisticsTracker: {
    loadStatistics: vi.fn(),
    getRecentSessions: vi.fn(),
    resetStatistics: vi.fn(),
    calculateOverallAccuracy: vi.fn(),
    getStatisticsForDifficulty: vi.fn(),
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('StatisticsDisplay', () => {
  const mockStatisticsTracker = statisticsTracker as any;

  const sampleStatistics: UserStatistics = {
    totalAttempts: 10,
    correctAnswers: 7,
    accuracyByDifficulty: { 3: 75, 4: 60 },
    sessionHistory: [],
  };

  const sampleRecentSessions: SessionResult[] = [
    {
      timestamp: new Date('2024-01-03T10:00:00Z'),
      difficulty: 3,
      correct: true,
      notesPlayed: ['C4', 'E4', 'G4'] as Note[],
      userAnswer: ['C4', 'E4', 'G4'] as Note[],
    },
    {
      timestamp: new Date('2024-01-02T09:00:00Z'),
      difficulty: 4,
      correct: false,
      notesPlayed: ['C4', 'E4', 'G4', 'B4'] as Note[],
      userAnswer: ['C4', 'E4', 'G4', 'A4'] as Note[],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockStatisticsTracker.loadStatistics.mockReturnValue(sampleStatistics);
    mockStatisticsTracker.getRecentSessions.mockReturnValue(sampleRecentSessions);
    mockStatisticsTracker.calculateOverallAccuracy.mockReturnValue(70);
    mockStatisticsTracker.getStatisticsForDifficulty.mockImplementation((difficulty: number) => {
      if (difficulty === 3) {
        return { attempts: 6, correct: 4, accuracy: 75 };
      }
      if (difficulty === 4) {
        return { attempts: 4, correct: 3, accuracy: 60 };
      }
      return { attempts: 0, correct: 0, accuracy: 0 };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render loading state initially', () => {
      render(<StatisticsDisplay />);

      expect(screen.getByText('Your Progress')).toBeInTheDocument();
      // Loading animation should be present
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render statistics after loading', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // Total games
        expect(screen.getByText('Total Games')).toBeInTheDocument();
        expect(screen.getByText('70%')).toBeInTheDocument(); // Overall accuracy
        expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
      });
    });

    it('should apply custom className', async () => {
      const { container } = render(<StatisticsDisplay className="custom-class" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });
  });

  describe('Empty Statistics', () => {
    it('should show empty state when no games played', async () => {
      const emptyStats: UserStatistics = {
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      };

      mockStatisticsTracker.loadStatistics.mockReturnValue(emptyStats);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('No games played yet')).toBeInTheDocument();
        expect(screen.getByText('Start playing to see your progress!')).toBeInTheDocument();
      });
    });

    it('should not show reset button when no games played', async () => {
      const emptyStats: UserStatistics = {
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      };

      mockStatisticsTracker.loadStatistics.mockReturnValue(emptyStats);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.queryByText('Reset Stats')).not.toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display', () => {
    it('should display overall statistics correctly', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Total Games')).toBeInTheDocument();
        expect(screen.getByText('70%')).toBeInTheDocument();
        expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
      });
    });

    it('should display accuracy by difficulty', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Accuracy by Difficulty')).toBeInTheDocument();
        expect(screen.getByText('3 Notes')).toBeInTheDocument();
        expect(screen.getByText('4 Notes')).toBeInTheDocument();
        expect(screen.getByText('(6 games)')).toBeInTheDocument();
        expect(screen.getByText('(4 games)')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();
      });
    });

    it('should display progress bars for difficulty levels', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        const progressBars = document.querySelectorAll('.bg-blue-500');

        expect(progressBars).toHaveLength(2); // One for each difficulty level
      });
    });
  });

  describe('Recent Sessions', () => {
    it('should display recent sessions by default', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Recent Games')).toBeInTheDocument();
        expect(screen.getByText('3 notes')).toBeInTheDocument();
        expect(screen.getByText('4 notes')).toBeInTheDocument();
      });
    });

    it('should not display recent sessions when showRecentSessions is false', async () => {
      render(<StatisticsDisplay showRecentSessions={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Recent Games')).not.toBeInTheDocument();
      });
    });

    it('should limit recent sessions based on maxRecentSessions prop', async () => {
      render(<StatisticsDisplay maxRecentSessions={1} />);

      await waitFor(() => {
        expect(mockStatisticsTracker.getRecentSessions).toHaveBeenCalledWith(1);
      });
    });

    it('should display correct and incorrect sessions with different styling', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        const correctSession = screen.getByText('3 notes').closest('div');
        const incorrectSession = screen.getByText('4 notes').closest('div');

        expect(correctSession).toHaveClass('bg-green-50', 'text-green-800');
        expect(incorrectSession).toHaveClass('bg-red-50', 'text-red-800');
      });
    });

    it('should format session timestamps correctly', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        // Should display formatted dates (exact format may vary by locale)
        expect(screen.getByText(/Jan 3/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 2/)).toBeInTheDocument();
      });
    });

    it('should display note counts in session details', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getAllByText('Played: 3 notes')).toHaveLength(1);
        expect(screen.getAllByText('Played: 4 notes')).toHaveLength(1);
        expect(screen.getAllByText('Answered: 3 notes')).toHaveLength(1);
        expect(screen.getAllByText('Answered: 4 notes')).toHaveLength(1);
      });
    });
  });

  describe('Performance Insights', () => {
    it('should show excellent performance message for high accuracy', async () => {
      mockStatisticsTracker.calculateOverallAccuracy.mockReturnValue(85);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Excellent work!/)).toBeInTheDocument();
      });
    });

    it('should show good progress message for medium accuracy', async () => {
      mockStatisticsTracker.calculateOverallAccuracy.mockReturnValue(70);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Good progress!/)).toBeInTheDocument();
      });
    });

    it('should show encouragement message for low accuracy', async () => {
      mockStatisticsTracker.calculateOverallAccuracy.mockReturnValue(50);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Keep practicing!/)).toBeInTheDocument();
      });
    });

    it('should only show insights when enough games have been played', async () => {
      const fewGamesStats: UserStatistics = {
        totalAttempts: 3,
        correctAnswers: 2,
        accuracyByDifficulty: { 3: 67 },
        sessionHistory: [],
      };

      mockStatisticsTracker.loadStatistics.mockReturnValue(fewGamesStats);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.queryByText('Performance Insights')).not.toBeInTheDocument();
      });
    });

    it('should suggest trying different difficulty levels when multiple levels played', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Try different difficulty levels/)).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should show reset button when games have been played', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Reset Stats')).toBeInTheDocument();
      });
    });

    it('should call onReset callback when statistics are reset', async () => {
      const onReset = vi.fn();
      mockConfirm.mockReturnValue(true);

      render(<StatisticsDisplay onReset={onReset} />);

      await waitFor(() => {
        const resetButton = screen.getByText('Reset Stats');
        fireEvent.click(resetButton);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to reset all statistics? This action cannot be undone.',
      );
      expect(mockStatisticsTracker.resetStatistics).toHaveBeenCalled();
      expect(onReset).toHaveBeenCalled();
    });

    it('should not reset when user cancels confirmation', async () => {
      const onReset = vi.fn();
      mockConfirm.mockReturnValue(false);

      render(<StatisticsDisplay onReset={onReset} />);

      await waitFor(() => {
        const resetButton = screen.getByText('Reset Stats');
        fireEvent.click(resetButton);
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockStatisticsTracker.resetStatistics).not.toHaveBeenCalled();
      expect(onReset).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error state when statistics fail to load', async () => {
      mockStatisticsTracker.loadStatistics.mockImplementation(() => {
        throw new Error('Failed to load');
      });

      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Unable to load statistics')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry loading statistics when retry button is clicked', async () => {
      mockStatisticsTracker.loadStatistics
        .mockImplementationOnce(() => {
          throw new Error('Failed to load');
        })
        .mockImplementationOnce(() => sampleStatistics);

      render(<StatisticsDisplay />);

      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Games')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: 'Your Progress' })).toBeInTheDocument();
        expect(screen.getByText('Accuracy by Difficulty')).toBeInTheDocument();
        expect(screen.getByText('Recent Games')).toBeInTheDocument();
      });
    });

    it('should have proper button accessibility', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        const resetButton = screen.getByText('Reset Stats');

        expect(resetButton).toHaveAttribute('title', 'Reset all statistics');
      });
    });

    it('should have tooltips for note information', async () => {
      render(<StatisticsDisplay />);

      await waitFor(() => {
        const playedNotes = screen.getAllByText('Played: 3 notes')[0];

        expect(playedNotes).toHaveAttribute('title', 'Played: C4, E4, G4');

        const answeredNotes = screen.getAllByText('Answered: 3 notes')[0];

        expect(answeredNotes).toHaveAttribute('title', 'Your answer: C4, E4, G4');
      });
    });
  });
});
