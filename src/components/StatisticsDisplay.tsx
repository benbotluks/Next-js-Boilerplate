/**
 * Statistics Display Component
 * Shows user progress and performance metrics
 */

'use client';

import type { SessionResult, UserStatistics } from '@/MusicTest/types/MusicTypes';
import { useEffect, useState } from 'react';
import { statisticsTracker } from '@/libs/StatisticsTracker';

export type StatisticsDisplayProps = {
  className?: string;
  showRecentSessions?: boolean;
  maxRecentSessions?: number;
  onReset?: () => void;
};

export function StatisticsDisplay({
  className = '',
  showRecentSessions = true,
  maxRecentSessions = 5,
  onReset,
}: StatisticsDisplayProps) {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [recentSessions, setRecentSessions] = useState<SessionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setIsLoading(true);
    try {
      const stats = statisticsTracker.loadStatistics();
      setStatistics(stats);

      if (showRecentSessions) {
        const recent = statisticsTracker.getRecentSessions(maxRecentSessions);
        setRecentSessions(recent);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      statisticsTracker.resetStatistics();
      loadStatistics();
      onReset?.();
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNotes = (notes: string[]) => {
    return notes.join(', ');
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            <div className="h-3 w-1/3 rounded bg-gray-200"></div>
            <div className="h-3 w-1/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>Unable to load statistics</p>
        <button
          onClick={loadStatistics}
          className="mt-2 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const overallAccuracy = statisticsTracker.calculateOverallAccuracy(statistics);
  const difficultyLevels = Object.keys(statistics.accuracyByDifficulty)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
        {statistics.totalAttempts > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-red-600 transition-colors hover:text-red-800"
            title="Reset all statistics"
          >
            Reset Stats
          </button>
        )}
      </div>

      {statistics.totalAttempts === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p className="mb-2 text-lg">No games played yet</p>
          <p className="text-sm">Start playing to see your progress!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalAttempts}</div>
              <div className="text-sm text-gray-600">Total Games</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {overallAccuracy}
                %
              </div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
          </div>

          {/* Accuracy by Difficulty */}
          {difficultyLevels.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium text-gray-700">Accuracy by Difficulty</h4>
              <div className="space-y-2">
                {difficultyLevels.map((difficulty) => {
                  const difficultyStats = statisticsTracker.getStatisticsForDifficulty(difficulty);
                  const accuracy = statistics.accuracyByDifficulty[difficulty];

                  return (
                    <div key={difficulty} className="flex items-center justify-between rounded bg-gray-50 p-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">
                          {difficulty}
                          {' '}
                          Notes
                        </span>
                        <span className="text-sm text-gray-500">
                          (
                          {difficultyStats.attempts}
                          {' '}
                          games)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${accuracy}%` }}
                          >
                          </div>
                        </div>
                        <span className="w-10 text-right text-sm font-medium text-gray-700">
                          {accuracy}
                          %
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          {showRecentSessions && recentSessions.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium text-gray-700">Recent Games</h4>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {recentSessions.map((session, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded p-2 text-sm ${
                      session.correct
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${
                        session.correct ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      >
                      </span>
                      <span>
                        {session.difficulty}
                        {' '}
                        notes
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(session.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs">
                      <div title={`Played: ${formatNotes(session.notesPlayed)}`}>
                        Played:
                        {' '}
                        {session.notesPlayed.length}
                        {' '}
                        notes
                      </div>
                      <div title={`Your answer: ${formatNotes(session.userAnswer)}`}>
                        Answered:
                        {' '}
                        {session.userAnswer.length}
                        {' '}
                        notes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Insights */}
          {statistics.totalAttempts >= 5 && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <h4 className="mb-1 font-medium text-blue-800">Performance Insights</h4>
              <div className="text-sm text-blue-700">
                {overallAccuracy >= 80 && (
                  <p>🎉 Excellent work! You're identifying notes with high accuracy.</p>
                )}
                {overallAccuracy >= 60 && overallAccuracy < 80 && (
                  <p>👍 Good progress! Keep practicing to improve your accuracy.</p>
                )}
                {overallAccuracy < 60 && (
                  <p>💪 Keep practicing! Focus on listening carefully to each note.</p>
                )}

                {difficultyLevels.length > 1 && (
                  <p className="mt-1">
                    Try different difficulty levels to challenge yourself and improve your skills.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
