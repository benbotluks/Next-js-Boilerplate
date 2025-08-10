'use client';

import type { GameControllerProps, GameState, Note } from '@/types/MusicTypes';
import type { ValidationResult } from '@/utils/AnswerValidation';
import React, { useCallback, useEffect, useState } from 'react';
import {
  CONFIG_HELPERS,
  DEFAULT_SESSION_SETTINGS,
  ERROR_MESSAGES,
  GAME_CONFIG,
  UI_CONFIG,
} from '@/config/gameConfig';
import { audioEngine } from '@/libs/AudioEngine';
import { settingsManager } from '@/libs/SettingsManager';
import { statisticsTracker } from '@/libs/StatisticsTracker';
import { EMPTY_OBJECT } from '@/types/MusicTypes';
import { validateAnswer } from '@/utils/AnswerValidation';
import { convertFromVexFlowFormat, convertToVexFlowFormat } from '@/utils/musicUtils';
import FeedbackDisplay from '../FeedbackDisplay';
import ClickableNoteInput from './ClickableNoteInput';

const MusicTestController: React.FC<GameControllerProps> = ({
  initialSettings = EMPTY_OBJECT,
}) => {
  // Load settings from SettingsManager
  const [settings, setSettings] = useState(() => {
    const savedSettings = settingsManager.loadSettings();
    return {
      ...savedSettings,
      ...DEFAULT_SESSION_SETTINGS, // Game-specific settings not in SettingsManager
      ...initialSettings, // Allow override from props
    };
  });

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentNotes: [],
    selectedNotes: [],
    gamePhase: 'setup',
    score: 0,
    totalAttempts: 0,
    difficulty: settings.maxNotes, // Use maxNotes as the base difficulty
    limitNotes: settings.limitNotes,
  });

  // Audio and UI state
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Handle settings changes and sync with SettingsManager
  const handleSettingsChange = useCallback((newSettings: Partial<typeof settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to SettingsManager (excluding game-specific settings)
    const { ...settingsToSave } = updatedSettings;
    settingsManager.saveSettings(settingsToSave);
  }, [settings]);

  // Listen for external settings changes (e.g., from SettingsPanel)
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = settingsManager.loadSettings();
      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));
    };

    // Listen for storage events (when settings change in another tab/component)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Initialize audio engine and check support
  useEffect(() => {
    const handler = (supported: boolean) => setIsAudioSupported(supported);
    const checkAudioSupport = () => {
      const supported = audioEngine.isSupported();
      handler(supported);
      if (supported) {
        audioEngine.setVolume(settings.volume);
      }
    };

    checkAudioSupport();
  }, [settings.volume]);

  // Start a new round
  const startNewRound = useCallback(async () => {
    try {
      setAudioError(null);
      // Generate random number of notes within the min/max range
      const noteCount = Math.floor(Math.random() * (settings.maxNotes - settings.minNotes + 1)) + settings.minNotes;
      const standardNotes = audioEngine.generateNoteSet(noteCount);
      const vexFlowNotes = standardNotes.map(convertToVexFlowFormat);

      setGameState(prev => ({
        ...prev,
        currentNotes: vexFlowNotes,
        selectedNotes: [],
        gamePhase: 'listening',
      }));

      // Play the notes using standard format
      setIsPlaying(true);
      await audioEngine.playNotes(standardNotes);

      // Transition to answering phase after notes finish playing
      setTimeout(() => {
        setIsPlaying(false);
        setGameState(prev => ({
          ...prev,
          gamePhase: 'answering',
        }));
      }, CONFIG_HELPERS.getTotalPlayTime()); // Notes play duration + buffer
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
  }, [settings.minNotes, settings.maxNotes]);

  // Replay current notes
  const replayNotes = useCallback(async () => {
    if (gameState.currentNotes.length === 0) {
      return;
    }

    try {
      setAudioError(null);
      setIsPlaying(true);

      // Convert VexFlow format back to standard format for audio playback
      const standardNotes = gameState.currentNotes.map(convertFromVexFlowFormat);
      await audioEngine.playNotes(standardNotes);

      setTimeout(() => {
        setIsPlaying(false);
      }, CONFIG_HELPERS.getTotalPlayTime());
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
    // Both currentNotes and selectedNotes are already in VexFlow format
    const result = validateAnswer(gameState.currentNotes, gameState.selectedNotes);
    setValidationResult(result);

    // Convert to standard format for statistics tracking
    const standardCurrentNotes = gameState.currentNotes.map(convertFromVexFlowFormat);
    const standardSelectedNotes = gameState.selectedNotes.map(convertFromVexFlowFormat);

    // Record session in statistics
    statisticsTracker.recordSession(
      gameState.difficulty,
      result.isCorrect,
      standardCurrentNotes,
      standardSelectedNotes,
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
            {ERROR_MESSAGES.AUDIO_NOT_SUPPORTED}
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
            Notes Range:
            {' '}
            {settings.minNotes}
            -
            {settings.maxNotes}
          </span>
        </div>

        {/* Game settings */}
        {gameState.gamePhase === 'setup' && (
          <div className="mb-4 flex flex-col items-center gap-4">
            {/* Note range selectors */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="minNotes" className="text-sm font-medium">
                  Min notes:
                </label>
                <select
                  id="minNotes"
                  value={settings.minNotes}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    handleSettingsChange({
                      minNotes: newMin,
                      maxNotes: Math.max(newMin, settings.maxNotes),
                    });
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                >
                  {UI_CONFIG.DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="maxNotes" className="text-sm font-medium">
                  Max notes:
                </label>
                <select
                  id="maxNotes"
                  value={settings.maxNotes}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    handleSettingsChange({
                      maxNotes: newMax,
                      minNotes: Math.min(newMax, settings.minNotes),
                    });
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                >
                  {UI_CONFIG.DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio mode selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="audioMode" className="text-sm font-medium">
                Note playback:
              </label>
              <select
                id="audioMode"
                value={settings.audioMode}
                onChange={e => handleSettingsChange({ audioMode: e.target.value as 'individual' | 'chord' })}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm"
              >
                {UI_CONFIG.AUDIO_MODE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
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
              type="button"
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
              Click "Start New Round" to begin. You'll hear between
              {' '}
              {settings.minNotes}
              {' '}
              and
              {' '}
              {settings.maxNotes}
              {' '}
              notes played simultaneously. Identify them by clicking on the staff.
            </p>
            <button
              type="button"
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
                  Playing notes...
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
                Select the notes you heard by clicking on the staff.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={replayNotes}
                  disabled={isPlaying}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {isPlaying ? 'Playing...' : 'Replay Notes'}
                </button>
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={gameState.selectedNotes.length === 0}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </div>
            </div>

            <ClickableNoteInput
              selectedNotes={gameState.selectedNotes}
              onNoteSelect={handleNoteSelect}
              onNoteDeselect={handleNoteDeselect}
              maxNotes={gameState.currentNotes.length} // Use actual number of notes in current round
              limitNotes={gameState.limitNotes}
              enableAudio={true} // Enable audio so users can hear notes as they place them
              audioMode={settings.audioMode} // Use selected audio mode
              width={GAME_CONFIG.STAFF_WIDTH}
              height={GAME_CONFIG.STAFF_HEIGHT}
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

            {/* Show the staff with validation results */}
            <div className="mt-6">
              <h3 className="mb-4 text-center text-lg font-semibold">
                {validationResult.isCorrect ? 'Correct Answer!' : 'Review Your Answer'}
              </h3>
              <ClickableNoteInput
                selectedNotes={gameState.selectedNotes}
                onNoteSelect={() => { }} // Read-only in feedback phase
                onNoteDeselect={() => { }} // Read-only in feedback phase
                maxNotes={gameState.currentNotes.length} // Use actual number of notes in current round
                limitNotes={gameState.limitNotes}
                showCorrectAnswer={true}
                correctNotes={gameState.currentNotes}
                validationResult={validationResult}
                disabled={true} // Disable interaction in feedback phase
                enableAudio={true} // Allow audio playback to hear the notes
                audioMode="chord" // Play all notes as a chord
                width={GAME_CONFIG.STAFF_WIDTH}
                height={GAME_CONFIG.STAFF_HEIGHT}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicTestController;
