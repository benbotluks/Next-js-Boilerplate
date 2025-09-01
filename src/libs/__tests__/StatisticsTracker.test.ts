/**
 * Unit tests for StatisticsTracker
 */

import type { Note, SessionResult, UserStatistics } from '@/MusicTest/types/MusicTypes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StatisticsTracker } from '../StatisticsTracker';

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

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StatisticsTracker', () => {
  let tracker: StatisticsTracker;

  beforeEach(() => {
    tracker = new StatisticsTracker();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadStatistics', () => {
    it('should return default statistics when no data exists', () => {
      const stats = tracker.loadStatistics();

      expect(stats).toEqual({
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      });
    });

    it('should load valid statistics from localStorage', () => {
      const validStats: UserStatistics = {
        totalAttempts: 5,
        correctAnswers: 3,
        accuracyByDifficulty: { 3: 60 },
        sessionHistory: [
          {
            timestamp: new Date('2024-01-01'),
            difficulty: 3,
            correct: true,
            notesPlayed: ['C4', 'E4', 'G4'] as Note[],
            userAnswer: ['C4', 'E4', 'G4'] as Note[],
          },
        ],
      };

      localStorageMock.setItem('music-test-statistics', JSON.stringify(validStats));

      const loaded = tracker.loadStatistics();

      expect(loaded.totalAttempts).toBe(5);
      expect(loaded.correctAnswers).toBe(3);
      expect(loaded.accuracyByDifficulty[3]).toBe(60);
      expect(loaded.sessionHistory).toHaveLength(1);
    });

    it('should return defaults when localStorage contains invalid data', () => {
      localStorageMock.setItem('music-test-statistics', 'invalid json');

      const stats = tracker.loadStatistics();

      expect(stats).toEqual({
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      });
    });

    it('should handle localStorage being unavailable', () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const stats = tracker.loadStatistics();

      expect(stats).toEqual({
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      });

      localStorageMock.getItem.mockImplementation(originalGetItem);
    });
  });

  describe('saveStatistics', () => {
    it('should save valid statistics to localStorage', () => {
      const stats: UserStatistics = {
        totalAttempts: 3,
        correctAnswers: 2,
        accuracyByDifficulty: { 3: 67 },
        sessionHistory: [],
      };

      const result = tracker.saveStatistics(stats);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'music-test-statistics',
        JSON.stringify(stats),
      );
    });

    it('should reject invalid statistics', () => {
      const invalidStats = {
        totalAttempts: -1, // Invalid: negative
        correctAnswers: 2,
        accuracyByDifficulty: {},
        sessionHistory: [],
      } as UserStatistics;

      const result = tracker.saveStatistics(invalidStats);

      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should trim session history when it exceeds maximum size', () => {
      const longHistory: SessionResult[] = Array.from({ length: 1100 }, (_, i) => ({
        timestamp: new Date(),
        difficulty: 3,
        correct: i % 2 === 0,
        notesPlayed: ['C4'] as Note[],
        userAnswer: ['C4'] as Note[],
      }));

      const stats: UserStatistics = {
        totalAttempts: 1100,
        correctAnswers: 550,
        accuracyByDifficulty: { 3: 50 },
        sessionHistory: longHistory,
      };

      tracker.saveStatistics(stats);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

      expect(savedData.sessionHistory).toHaveLength(1000);
    });

    it('should handle localStorage save errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const stats: UserStatistics = {
        totalAttempts: 1,
        correctAnswers: 1,
        accuracyByDifficulty: {},
        sessionHistory: [],
      };

      const result = tracker.saveStatistics(stats);

      expect(result).toBe(false);
    });
  });

  describe('recordSession', () => {
    it('should record a correct session and update statistics', () => {
      const notesPlayed: Note[] = ['C4', 'E4', 'G4'];
      const userAnswer: Note[] = ['C4', 'E4', 'G4'];

      const updatedStats = tracker.recordSession(3, true, notesPlayed, userAnswer);

      expect(updatedStats.totalAttempts).toBe(1);
      expect(updatedStats.correctAnswers).toBe(1);
      expect(updatedStats.accuracyByDifficulty[3]).toBe(100);
      expect(updatedStats.sessionHistory).toHaveLength(1);

      const session = updatedStats.sessionHistory[0];

      expect(session.difficulty).toBe(3);
      expect(session.correct).toBe(true);
      expect(session.notesPlayed).toEqual(notesPlayed);
      expect(session.userAnswer).toEqual(userAnswer);
      expect(session.timestamp).toBeInstanceOf(Date);
    });

    it('should record an incorrect session and update statistics', () => {
      const notesPlayed: Note[] = ['C4', 'E4', 'G4'];
      const userAnswer: Note[] = ['C4', 'F4', 'G4'];

      const updatedStats = tracker.recordSession(3, false, notesPlayed, userAnswer);

      expect(updatedStats.totalAttempts).toBe(1);
      expect(updatedStats.correctAnswers).toBe(0);
      expect(updatedStats.accuracyByDifficulty[3]).toBe(0);
      expect(updatedStats.sessionHistory).toHaveLength(1);

      const session = updatedStats.sessionHistory[0];

      expect(session.correct).toBe(false);
    });

    it('should accumulate multiple sessions correctly', () => {
      // Record first session (correct)
      tracker.recordSession(3, true, ['C4', 'E4', 'G4'] as Note[], ['C4', 'E4', 'G4'] as Note[]);

      // Record second session (incorrect)
      tracker.recordSession(3, false, ['D4', 'F4', 'A4'] as Note[], ['D4', 'F4', 'B4'] as Note[]);

      // Record third session (correct, different difficulty)
      const finalStats = tracker.recordSession(4, true, ['C4', 'E4', 'G4', 'B4'] as Note[], ['C4', 'E4', 'G4', 'B4'] as Note[]);

      expect(finalStats.totalAttempts).toBe(3);
      expect(finalStats.correctAnswers).toBe(2);
      expect(finalStats.accuracyByDifficulty[3]).toBe(50); // 1/2 correct at difficulty 3
      expect(finalStats.accuracyByDifficulty[4]).toBe(100); // 1/1 correct at difficulty 4
      expect(finalStats.sessionHistory).toHaveLength(3);
    });
  });

  describe('calculateOverallAccuracy', () => {
    it('should return 0 for no attempts', () => {
      const stats: UserStatistics = {
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      };

      const accuracy = tracker.calculateOverallAccuracy(stats);

      expect(accuracy).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const stats: UserStatistics = {
        totalAttempts: 10,
        correctAnswers: 7,
        accuracyByDifficulty: {},
        sessionHistory: [],
      };

      const accuracy = tracker.calculateOverallAccuracy(stats);

      expect(accuracy).toBe(70);
    });

    it('should round to nearest integer', () => {
      const stats: UserStatistics = {
        totalAttempts: 3,
        correctAnswers: 2,
        accuracyByDifficulty: {},
        sessionHistory: [],
      };

      const accuracy = tracker.calculateOverallAccuracy(stats);

      expect(accuracy).toBe(67); // 66.67 rounded
    });
  });

  describe('calculateAccuracyByDifficulty', () => {
    it('should calculate accuracy for multiple difficulty levels', () => {
      const sessionHistory: SessionResult[] = [
        { timestamp: new Date(), difficulty: 2, correct: true, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 2, correct: false, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 3, correct: true, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 3, correct: true, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 3, correct: false, notesPlayed: [], userAnswer: [] },
      ];

      const accuracy = tracker.calculateAccuracyByDifficulty(sessionHistory);

      expect(accuracy[2]).toBe(50); // 1/2 correct
      expect(accuracy[3]).toBe(67); // 2/3 correct (rounded)
    });

    it('should handle empty session history', () => {
      const accuracy = tracker.calculateAccuracyByDifficulty([]);

      expect(accuracy).toEqual({});
    });
  });

  describe('getRecentSessions', () => {
    it('should return recent sessions in reverse chronological order', () => {
      const sessions: SessionResult[] = [
        { timestamp: new Date('2024-01-01'), difficulty: 2, correct: true, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date('2024-01-02'), difficulty: 3, correct: false, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date('2024-01-03'), difficulty: 4, correct: true, notesPlayed: [], userAnswer: [] },
      ];

      // Save sessions to storage
      const stats: UserStatistics = {
        totalAttempts: 3,
        correctAnswers: 2,
        accuracyByDifficulty: {},
        sessionHistory: sessions,
      };
      tracker.saveStatistics(stats);

      const recent = tracker.getRecentSessions(2);

      expect(recent).toHaveLength(2);
      expect(new Date(recent[0].timestamp).getTime()).toBeGreaterThan(new Date(recent[1].timestamp).getTime());
      expect(recent[0].difficulty).toBe(4); // Most recent
      expect(recent[1].difficulty).toBe(3); // Second most recent
    });

    it('should default to 10 sessions when no count specified', () => {
      const sessions: SessionResult[] = Array.from({ length: 15 }, (_, i) => ({
        timestamp: new Date(`2024-01-${i + 1}`),
        difficulty: 3,
        correct: true,
        notesPlayed: [],
        userAnswer: [],
      }));

      const stats: UserStatistics = {
        totalAttempts: 15,
        correctAnswers: 15,
        accuracyByDifficulty: {},
        sessionHistory: sessions,
      };
      tracker.saveStatistics(stats);

      const recent = tracker.getRecentSessions();

      expect(recent).toHaveLength(10);
    });
  });

  describe('getStatisticsForDifficulty', () => {
    it('should return statistics for specific difficulty level', () => {
      const sessions: SessionResult[] = [
        { timestamp: new Date(), difficulty: 3, correct: true, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 3, correct: false, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 3, correct: true, notesPlayed: [], userAnswer: [] },
        { timestamp: new Date(), difficulty: 4, correct: true, notesPlayed: [], userAnswer: [] }, // Different difficulty
      ];

      const stats: UserStatistics = {
        totalAttempts: 4,
        correctAnswers: 3,
        accuracyByDifficulty: {},
        sessionHistory: sessions,
      };
      tracker.saveStatistics(stats);

      const difficultyStats = tracker.getStatisticsForDifficulty(3);

      expect(difficultyStats.attempts).toBe(3);
      expect(difficultyStats.correct).toBe(2);
      expect(difficultyStats.accuracy).toBe(67);
    });

    it('should return zero stats for unused difficulty level', () => {
      const difficultyStats = tracker.getStatisticsForDifficulty(5);

      expect(difficultyStats.attempts).toBe(0);
      expect(difficultyStats.correct).toBe(0);
      expect(difficultyStats.accuracy).toBe(0);
    });
  });

  describe('resetStatistics', () => {
    it('should clear statistics and return defaults', () => {
      // First save some data
      const stats: UserStatistics = {
        totalAttempts: 5,
        correctAnswers: 3,
        accuracyByDifficulty: { 3: 60 },
        sessionHistory: [],
      };
      tracker.saveStatistics(stats);

      // Reset statistics
      const resetStats = tracker.resetStatistics();

      expect(resetStats).toEqual({
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('music-test-statistics');
    });

    it('should handle localStorage removal errors', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Cannot remove item');
      });

      const resetStats = tracker.resetStatistics();

      expect(resetStats).toEqual({
        totalAttempts: 0,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      });
    });
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(tracker.isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage is unavailable', () => {
      const originalLocalStorage = globalThis.localStorage;
      // @ts-expect-error - Testing undefined localStorage
      globalThis.localStorage = undefined;

      expect(tracker.isStorageAvailable()).toBe(false);

      globalThis.localStorage = originalLocalStorage;
    });

    it('should return false when localStorage throws errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(tracker.isStorageAvailable()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate statistics with correct data', () => {
      const validStats: UserStatistics = {
        totalAttempts: 5,
        correctAnswers: 3,
        accuracyByDifficulty: { 3: 60, 4: 75 },
        sessionHistory: [
          {
            timestamp: new Date(),
            difficulty: 3,
            correct: true,
            notesPlayed: ['C4'] as Note[],
            userAnswer: ['C4'] as Note[],
          },
        ],
      };

      const result = tracker.saveStatistics(validStats);

      expect(result).toBe(true);
    });

    it('should reject statistics with invalid totalAttempts', () => {
      const invalidStats = {
        totalAttempts: -1,
        correctAnswers: 0,
        accuracyByDifficulty: {},
        sessionHistory: [],
      } as UserStatistics;

      const result = tracker.saveStatistics(invalidStats);

      expect(result).toBe(false);
    });

    it('should reject statistics with correctAnswers exceeding totalAttempts', () => {
      const invalidStats = {
        totalAttempts: 2,
        correctAnswers: 5,
        accuracyByDifficulty: {},
        sessionHistory: [],
      } as UserStatistics;

      const result = tracker.saveStatistics(invalidStats);

      expect(result).toBe(false);
    });

    it('should reject statistics with invalid difficulty levels', () => {
      const invalidStats = {
        totalAttempts: 1,
        correctAnswers: 1,
        accuracyByDifficulty: { 1: 100, 7: 50 }, // Invalid difficulty levels
        sessionHistory: [],
      } as UserStatistics;

      const result = tracker.saveStatistics(invalidStats);

      expect(result).toBe(false);
    });

    it('should reject statistics with invalid session data', () => {
      const invalidStats = {
        totalAttempts: 1,
        correctAnswers: 1,
        accuracyByDifficulty: {},
        sessionHistory: [
          {
            timestamp: 'invalid-date',
            difficulty: 10, // Invalid difficulty
            correct: 'not-boolean',
            notesPlayed: 'not-array',
            userAnswer: null,
          },
        ],
      } as any;

      const result = tracker.saveStatistics(invalidStats);

      expect(result).toBe(false);
    });
  });
});
