'use client';

import type { GameControllerProps, GameState, Note } from '@/types/MusicTypes';
import type { ValidationResult } from '@/utils/AnswerValidation';
import React, { useCallback, useEffect, useState } from 'react';
import { audioEngine } from '@/libs/AudioEngine';
import { statisticsTracker } from '@/libs/StatisticsTracker';
import { validateAnswer } from '@/utils/AnswerValidation';
import DigitalStaff from './DigitalStaff';
import FeedbackDisplay from './FeedbackDisplay';

const MusicTestController: React.FC<GameControllerProps> = ({
  initialSettings = {},
}) => {
  // Default settings
  const defaultSettings = {
    noteCount: 3,
    volume: 0.7,
    autoReplay: false,
    ...initialSettings,
  };

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentNotes: [],
    selectedNotes: [],
    gamePhase: 'setup',
    score: 0,
    totalAttempts: 0,
    difficulty: defaultSettings.noteCount,
  });

  // Audio and UI state
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Initialize audio engine and check support
  useEffect(() => {
    const checkAudioSupport = () => {
      const supported = audioEngine.isSupported();
      setIsAudioSupported(supported);

      if (supported) {
        audioEngine.setVolume(defaultSettings.volume);
      }
    };

    checkAudioSupport();
  }, [defaultSettings.volume]);

  // Start a new round
  const startNewRound = useCallback(async () => {
    try {
      setAudioError(null);

      // Generate new notes
      const newNotes = audioEngine.generateNoteSet(gameState.difficulty);

      // Update game state
      setGameState(prev => ({
        ...prev,
        currentNotes: newNotes,
        selectedNotes: [],
        gamePhase: 'listening',
      }));

      // Play the notes
      setIsPlaying(true);
      await audioEngine.playNotes(newNotes);

      // Transition to answering phase after notes finish playing
      setTimeout(() => {
        setIsPlaying(false);
        setGameState(prev => ({
          ...prev,
          gamePhase: 'answering',
        }));
      }, 2100); // Notes play for 2 seconds + small buffer
    } catch (error) {
      console.error('Failed to start new round:', error);
      setAudioError(error instanceof Error ? error.message : 'Failed to play audio');
      setIsPlaying(false);

      // Reset to setup phase on error
      setGameState(prev => ({
        ...prev,
        gamePhase: 'setup',
      }));
    }
  }, [gameState.difficulty]);

  // Replay current notes
  const replayNotes = useCallback(async () => {
    if (gameState.currentNotes.length === 0) {
      return;
    }

    try {
      setAudioError(null);
      setIsPlaying(true);
      await audioEngine.playNotes(gameState.currentNotes);

      setTimeout(() => {
        setIsPlaying(false);
      }, 2100);
    } catch (error) {
      console.error('Failed to replay notes:', error);
      setAudioError(error instanceof Error ? error.message : 'Failed to replay audio');
      setIsPlaying(false);
    }
  }, [gameState.currentNotes]);

  // Handle note selection on staff
  const handleNoteSelect = useCallback((note: Note) => {
    if (gameState.gamePhase !== 'answering') {
      return;
    }

    setGameState(prev => ({
      ...prev,
      selectedNotes: [...prev.selectedNotes, note],
    }));
  }, [gameState.gamePhase]);

  // Handle note deselection on staff
  const handleNoteDeselect = useCallback((note: Note) => {
    if (gameState.gamePhase !== 'answering') {
      return;
    }

    setGameState(prev => ({
      ...prev,
      selectedNotes: prev.selectedNotes.filter(n => n !== note),
    }));
  }, [gameState.gamePhase]);

  // Submit answer and show feedback
  const submitAnswer = useCallback(() => {
    if (gameState.gamePhase !== 'answering' || gameState.selectedNotes.length === 0) {
      return;
    }

    // Validate the answer using the enhanced validation logic
    const result = validateAnswer(gameState.currentNotes, gameState.selectedNotes);
    setValidationResult(result);

    // Record session in statistics
    statisticsTracker.recordSession(
      gameState.difficulty,
      result.isCorrect,
      gameState.currentNotes,
      gameState.selectedNotes,
    );

    // Update game state with results
    setGameState(prev => ({
      ...prev,
      gamePhase: 'feedback',
      score: result.isCorrect ? prev.score + 1 : prev.score,
      totalAttempts: prev.totalAttempts + 1,
    }));
  }, [gameState.gamePhase, gameState.selectedNotes, gameState.currentNotes, gameState.difficulty]);

  // Reset game to setup phase
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentNotes: [],
      selectedNotes: [],
      gamePhase: 'setup',
    }));
    setAudioError(null);
    setIsPlaying(false);
    setValidationResult(null);
  }, []);

  // Update difficulty setting
  const updateDifficulty = useCallback((newDifficulty: number) => {
    if (newDifficulty < 2 || newDifficulty > 6) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
    }));
  }, []);

  // Calculate accuracy percentage
  const accuracyPercentage = gameState.totalAttempts > 0
    ? Math.round((gameState.score / gameState.totalAttempts) * 100)
    : 0;

  // Render audio error message
  if (!isAudioSupported) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-800">
            Audio Not Supported
          </h2>
          <p className="text-red-600">
            Your browser doesn't support the Web Audio API required for this application.
            Please try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center p-6">
      {/* Header with game info */}
      <div className="mb-6 w-full">
        <h1 className="mb-4 text-center text-3xl font-bold">
          Music Note Identification
        </h1>

        {/* Game statistics */}
        <div className="mb-4 flex justify-center gap-6 text-sm text-gray-600">
          <span>
            Score:
            {gameState.score}
            /
            {gameState.totalAttempts}
          </span>
          {gameState.totalAttempts > 0 && (
            <span>
              Accuracy:
              {accuracyPercentage}
              %
            </span>
          )}
          <span>
            Difficulty:
            {gameState.difficulty}
            {' '}
            notes
          </span>
        </div>

        {/* Difficulty selector */}
        {gameState.gamePhase === 'setup' && (
          <div className="mb-4 flex items-center justify-center gap-2">
            <label htmlFor="difficulty" className="text-sm font-medium">
              Number of notes:
            </label>
            <select
              id="difficulty"
              value={gameState.difficulty}
              onChange={e => updateDifficulty(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              {[2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Audio error display */}
      {audioError && (
        <div className="mb-4 w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Audio Error:
              {' '}
              {audioError}
            </p>
            <button
              onClick={() => setAudioError(null)}
              className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Game phase content */}
      <div className="w-full">
        {/* Setup phase */}
        {gameState.gamePhase === 'setup' && (
          <div className="text-center">
            <p className="mb-6 text-gray-600">
              Click "Start New Round" to begin. You'll hear
              {' '}
              {gameState.difficulty}
              {' '}
              notes
              played simultaneously. Identify them by clicking on the staff.
            </p>
            <button
              onClick={startNewRound}
              disabled={isPlaying}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlaying ? 'Loading...' : 'Start New Round'}
            </button>
          </div>
        )}

        {/* Listening phase */}
        {gameState.gamePhase === 'listening' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-600"></div>
                <span className="font-medium text-blue-800">
                  Playing
                  {' '}
                  {gameState.difficulty}
                  {' '}
                  notes...
                </span>
              </div>
            </div>
            <p className="text-gray-600">
              Listen carefully to the notes being played.
            </p>
          </div>
        )}

        {/* Answering phase */}
        {gameState.gamePhase === 'answering' && (
          <div>
            <div className="mb-6 text-center">
              <p className="mb-4 text-gray-600">
                Select the
                {' '}
                {gameState.difficulty}
                {' '}
                notes you heard by clicking on the staff.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={replayNotes}
                  disabled={isPlaying}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {isPlaying ? 'Playing...' : 'Replay Notes'}
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={gameState.selectedNotes.length === 0}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </div>
            </div>

            <DigitalStaff
              selectedNotes={gameState.selectedNotes}
              onNoteSelect={handleNoteSelect}
              onNoteDeselect={handleNoteDeselect}
              maxNotes={gameState.difficulty}
            />
          </div>
        )}

        {/* Feedback phase */}
        {gameState.gamePhase === 'feedback' && validationResult && (
          <div>
            <FeedbackDisplay
              validationResult={validationResult}
              onReplayNotes={replayNotes}
              onNextRound={startNewRound}
              onResetGame={resetGame}
              isPlaying={isPlaying}
              className="mb-6"
            />

            <DigitalStaff
              selectedNotes={gameState.selectedNotes}
              onNoteSelect={() => {}} // Disabled in feedback phase
              onNoteDeselect={() => {}} // Disabled in feedback phase
              maxNotes={gameState.difficulty}
              showCorrectAnswer={true}
              correctNotes={gameState.currentNotes}
              validationResult={validationResult}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicTestController;
