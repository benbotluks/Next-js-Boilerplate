'use client';

import type { ValidationResult } from '@/utils/AnswerValidation';
import React from 'react';
import { generateFeedbackMessage } from '@/utils/AnswerValidation';

export type FeedbackDisplayProps = {
  validationResult: ValidationResult;
  onReplayNotes?: () => void;
  onNextRound?: () => void;
  onResetGame?: () => void;
  isPlaying?: boolean;
  className?: string;
};

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  validationResult,
  onReplayNotes,
  onNextRound,
  onResetGame,
  isPlaying = false,
  className = '',
}) => {
  const {
    isCorrect,
    correctNotes,
    selectedNotes,
    correctlyIdentified,
    missedNotes,
    incorrectNotes,
    accuracy,
  } = validationResult;

  const feedbackMessage = generateFeedbackMessage(validationResult);

  return (
    <div className={`rounded-lg border p-6 ${className}`}>
      {/* Main result indicator */}
      <div className="mb-6 text-center">
        <div
          className={`inline-flex items-center gap-3 rounded-lg px-6 py-3 ${
            isCorrect
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full ${
              isCorrect ? 'bg-green-600' : 'bg-red-600'
            }`}
          />
          <span className="text-lg font-semibold">
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </span>
          <span className="text-sm font-medium">
            {accuracy}% Accuracy
          </span>
        </div>
      </div>

      {/* Detailed feedback message */}
      <div className="mb-6 text-center">
        <p className="text-gray-700">{feedbackMessage}</p>
      </div>

      {/* Note breakdown */}
      <div className="mb-6 space-y-4">
        {/* Correct notes display */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Correct Notes:
          </h4>
          <div className="flex flex-wrap gap-2">
            {correctNotes.map(note => (
              <span
                key={note}
                className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Your answer display */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Your Answer:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedNotes.length > 0
              ? (
                  selectedNotes.map((note) => {
                    let colorClass = 'bg-gray-100 text-gray-800';
                    if (correctlyIdentified.includes(note)) {
                      colorClass = 'bg-green-100 text-green-800';
                    } else if (incorrectNotes.includes(note)) {
                      colorClass = 'bg-red-100 text-red-800';
                    }

                    return (
                      <span
                        key={note}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}
                      >
                        {note}
                      </span>
                    );
                  })
                )
              : (
                  <span className="text-sm text-gray-500 italic">
                    No notes selected
                  </span>
                )}
          </div>
        </div>

        {/* Missed notes (if any) */}
        {missedNotes.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Missed Notes:
            </h4>
            <div className="flex flex-wrap gap-2">
              {missedNotes.map(note => (
                <span
                  key={note}
                  className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color legend */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-600" />
            <span className="text-gray-700">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-600" />
            <span className="text-gray-700">Incorrect</span>
          </div>
          {missedNotes.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-600" />
              <span className="text-gray-700">Missed</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {onReplayNotes && (
          <button
            type="button"
            onClick={onReplayNotes}
            disabled={isPlaying}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlaying ? 'Playing...' : 'Replay Correct Notes'}
          </button>
        )}
        {onNextRound && (
          <button
            type="button"
            onClick={onNextRound}
            disabled={isPlaying}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next Round
          </button>
        )}
        {onResetGame && (
          <button
            type="button"
            onClick={onResetGame}
            className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedbackDisplay;