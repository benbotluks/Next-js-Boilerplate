/**
 * Statistics Tracker for Music Note Identification Game
 * Handles performance data collection and analysis
 */

import type { Note, SessionResult, UserStatistics } from '@/types/MusicTypes';

export type StatisticsValidationResult = {
  isValid: boolean;
  errors: string[];
  correctedStatistics?: UserStatistics;
};

export class StatisticsTracker {
  private static readonly STORAGE_KEY = 'music-test-statistics';
  private static readonly MAX_HISTORY_SIZE = 1000; // Limit history to prevent storage bloat

  private static readonly DEFAULT_STATISTICS: UserStatistics = {
    totalAttempts: 0,
    correctAnswers: 0,
    accuracyByDifficulty: {},
    sessionHistory: [],
  };

  /**
   * Load statistics from local storage with fallback to defaults
   */
  public loadStatistics(): UserStatistics {
    try {
      const stored = localStorage.getItem(StatisticsTracker.STORAGE_KEY);
      if (!stored) {
        return { ...StatisticsTracker.DEFAULT_STATISTICS };
      }

      const parsed = JSON.parse(stored) as Partial<UserStatistics>;
      const validation = this.validateStatistics(parsed);

      if (validation.isValid && validation.correctedStatistics) {
        return validation.correctedStatistics;
      }

      // If validation failed, return defaults and clear invalid data
      localStorage.removeItem(StatisticsTracker.STORAGE_KEY);
      return { ...StatisticsTracker.DEFAULT_STATISTICS };
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return { ...StatisticsTracker.DEFAULT_STATISTICS };
    }
  }

  /**
   * Save statistics to local storage
   */
  public saveStatistics(statistics: UserStatistics): boolean {
    try {
      const validation = this.validateStatistics(statistics);
      if (!validation.isValid) {
        throw new Error(`Invalid statistics: ${validation.errors.join(', ')}`);
      }

      const statisticsToSave = validation.correctedStatistics || statistics;

      // Trim history if it exceeds maximum size
      if (statisticsToSave.sessionHistory.length > StatisticsTracker.MAX_HISTORY_SIZE) {
        statisticsToSave.sessionHistory = statisticsToSave.sessionHistory
          .slice(-StatisticsTracker.MAX_HISTORY_SIZE);
      }

      localStorage.setItem(StatisticsTracker.STORAGE_KEY, JSON.stringify(statisticsToSave));
      return true;
    } catch (error) {
      console.error('Failed to save statistics:', error);
      return false;
    }
  }

  /**
   * Record a new session result and update statistics
   */
  public recordSession(
    difficulty: number,
    correct: boolean,
    notesPlayed: Note[],
    userAnswer: Note[],
  ): UserStatistics {
    const currentStats = this.loadStatistics();

    const sessionResult: SessionResult = {
      timestamp: new Date(),
      difficulty,
      correct,
      notesPlayed: [...notesPlayed],
      userAnswer: [...userAnswer],
    };

    // Update overall statistics
    const updatedStats: UserStatistics = {
      totalAttempts: currentStats.totalAttempts + 1,
      correctAnswers: currentStats.correctAnswers + (correct ? 1 : 0),
      accuracyByDifficulty: { ...currentStats.accuracyByDifficulty },
      sessionHistory: [...currentStats.sessionHistory, sessionResult],
    };

    // Update difficulty-specific accuracy
    updatedStats.accuracyByDifficulty = this.calculateAccuracyByDifficulty(updatedStats.sessionHistory);

    // Save updated statistics
    this.saveStatistics(updatedStats);

    return updatedStats;
  }

  /**
   * Calculate overall accuracy percentage
   */
  public calculateOverallAccuracy(statistics: UserStatistics): number {
    if (statistics.totalAttempts === 0) {
      return 0;
    }
    return Math.round((statistics.correctAnswers / statistics.totalAttempts) * 100);
  }

  /**
   * Calculate accuracy by difficulty level
   */
  public calculateAccuracyByDifficulty(sessionHistory: SessionResult[]): Record<number, number> {
    const difficultyStats: Record<number, { correct: number; total: number }> = {};

    // Count attempts and correct answers by difficulty
    sessionHistory.forEach((session) => {
      if (!difficultyStats[session.difficulty]) {
        difficultyStats[session.difficulty] = { correct: 0, total: 0 };
      }
      difficultyStats[session.difficulty].total++;
      if (session.correct) {
        difficultyStats[session.difficulty].correct++;
      }
    });

    // Convert to percentages
    const accuracyByDifficulty: Record<number, number> = {};
    Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
      const difficultyNum = Number.parseInt(difficulty, 10);
      accuracyByDifficulty[difficultyNum] = stats.total > 0
        ? Math.round((stats.correct / stats.total) * 100)
        : 0;
    });

    return accuracyByDifficulty;
  }

  /**
   * Get recent session history (last n sessions)
   */
  public getRecentSessions(count: number = 10): SessionResult[] {
    const statistics = this.loadStatistics();
    return statistics.sessionHistory
      .slice(-count)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get statistics for a specific difficulty level
   */
  public getStatisticsForDifficulty(difficulty: number): {
    attempts: number;
    correct: number;
    accuracy: number;
  } {
    const statistics = this.loadStatistics();
    const sessions = statistics.sessionHistory.filter(s => s.difficulty === difficulty);

    const attempts = sessions.length;
    const correct = sessions.filter(s => s.correct).length;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

    return { attempts, correct, accuracy };
  }

  /**
   * Reset all statistics to defaults
   */
  public resetStatistics(): UserStatistics {
    try {
      localStorage.removeItem(StatisticsTracker.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear statistics from storage:', error);
    }
    return { ...StatisticsTracker.DEFAULT_STATISTICS };
  }

  /**
   * Validate statistics data structure
   */
  private validateStatistics(statistics: Partial<UserStatistics>): StatisticsValidationResult {
    const errors: string[] = [];
    const corrected: UserStatistics = { ...StatisticsTracker.DEFAULT_STATISTICS };

    // Validate totalAttempts
    if (statistics.totalAttempts !== undefined) {
      if (typeof statistics.totalAttempts !== 'number' || !Number.isInteger(statistics.totalAttempts) || statistics.totalAttempts < 0) {
        errors.push('totalAttempts must be a non-negative integer');
      } else {
        corrected.totalAttempts = statistics.totalAttempts;
      }
    }

    // Validate correctAnswers
    if (statistics.correctAnswers !== undefined) {
      if (typeof statistics.correctAnswers !== 'number' || !Number.isInteger(statistics.correctAnswers) || statistics.correctAnswers < 0) {
        errors.push('correctAnswers must be a non-negative integer');
      } else {
        corrected.correctAnswers = statistics.correctAnswers;
      }
    }

    // Validate accuracyByDifficulty
    if (statistics.accuracyByDifficulty !== undefined) {
      if (typeof statistics.accuracyByDifficulty !== 'object' || statistics.accuracyByDifficulty === null) {
        errors.push('accuracyByDifficulty must be an object');
      } else {
        const validAccuracy: Record<number, number> = {};
        Object.entries(statistics.accuracyByDifficulty).forEach(([key, value]) => {
          const difficulty = Number.parseInt(key, 10);
          if ((isNaN(difficulty)) || difficulty < 2 || difficulty > 6) {
            errors.push(`Invalid difficulty level: ${key}`);
          } else if (typeof value !== 'number' || value < 0 || value > 100) {
            errors.push(`Invalid accuracy value for difficulty ${key}: ${value}`);
          } else {
            validAccuracy[difficulty] = value;
          }
        });
        corrected.accuracyByDifficulty = validAccuracy;
      }
    }

    // Validate sessionHistory
    if (statistics.sessionHistory !== undefined) {
      if (!Array.isArray(statistics.sessionHistory)) {
        errors.push('sessionHistory must be an array');
      } else {
        const validSessions: SessionResult[] = [];
        statistics.sessionHistory.forEach((session, index) => {
          const sessionErrors = this.validateSessionResult(session);
          if (sessionErrors.length === 0) {
            validSessions.push({
              ...session,
              timestamp: new Date(session.timestamp),
            });
          } else {
            errors.push(`Invalid session at index ${index}: ${sessionErrors.join(', ')}`);
          }
        });
        corrected.sessionHistory = validSessions;
      }
    }

    // Ensure correctAnswers doesn't exceed totalAttempts
    if (corrected.correctAnswers > corrected.totalAttempts) {
      errors.push('correctAnswers cannot exceed totalAttempts');
    }

    return {
      isValid: errors.length === 0,
      errors,
      correctedStatistics: errors.length === 0 ? corrected : undefined,
    };
  }

  /**
   * Validate a single session result
   */
  private validateSessionResult(session: any): string[] {
    const errors: string[] = [];

    if (!session || typeof session !== 'object') {
      errors.push('session must be an object');
      return errors;
    }

    // Validate timestamp
    if (!session.timestamp) {
      errors.push('timestamp is required');
    } else {
      const date = new Date(session.timestamp);
      if (isNaN(date.getTime())) {
        errors.push('timestamp must be a valid date');
      }
    }

    // Validate difficulty
    if (typeof session.difficulty !== 'number' || !Number.isInteger(session.difficulty) || session.difficulty < 2 || session.difficulty > 6) {
      errors.push('difficulty must be an integer between 2 and 6');
    }

    // Validate correct
    if (typeof session.correct !== 'boolean') {
      errors.push('correct must be a boolean');
    }

    // Validate notesPlayed
    if (!Array.isArray(session.notesPlayed)) {
      errors.push('notesPlayed must be an array');
    }

    // Validate userAnswer
    if (!Array.isArray(session.userAnswer)) {
      errors.push('userAnswer must be an array');
    }

    return errors;
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
export const statisticsTracker = new StatisticsTracker();
