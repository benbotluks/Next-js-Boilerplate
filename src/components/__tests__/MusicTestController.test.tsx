import type { Note } from '@/types/MusicTypes';
import { page } from '@vitest/browser/context';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { audioEngine } from '@/libs/AudioEngine';
import MusicTestController from '../MusicTestController';

// Mock the AudioEngine
vi.mock('@/libs/AudioEngine', () => ({
  audioEngine: {
    isSupported: vi.fn(),
    setVolume: vi.fn(),
    generateNoteSet: vi.fn(),
    playNotes: vi.fn(),
    stopNotes: vi.fn(),
  },
}));

// Mock the DigitalStaff component
vi.mock('../DigitalStaff', () => ({
  default: ({
    selectedNotes,
    onNoteSelect,
    onNoteDeselect,
    maxNotes,
    showCorrectAnswer,
    correctNotes,
    validationResult,
  }: any) => (
    <div data-testid="digital-staff">
      <div data-testid="selected-notes">{selectedNotes.join(',')}</div>
      <div data-testid="max-notes">{maxNotes}</div>
      <div data-testid="show-correct">{showCorrectAnswer ? 'true' : 'false'}</div>
      <div data-testid="correct-notes">{correctNotes?.join(',') || ''}</div>
      <div data-testid="validation-result">{validationResult ? 'present' : 'absent'}</div>
      <button
        type="button"
        data-testid="select-note-C4"
        onClick={() => onNoteSelect('C4')}
      >
        Select C4
      </button>
      <button
        type="button"
        data-testid="deselect-note-C4"
        onClick={() => onNoteDeselect('C4')}
      >
        Deselect C4
      </button>
    </div>
  ),
}));

// Mock the FeedbackDisplay component
vi.mock('../FeedbackDisplay', () => ({
  default: ({ validationResult, onReplayNotes, onNextRound, onResetGame, isPlaying }: any) => (
    <div data-testid="feedback-display">
      <div data-testid="feedback-correct">{validationResult?.isCorrect ? 'true' : 'false'}</div>
      <div data-testid="feedback-accuracy">{validationResult?.accuracy || 0}</div>
      <button type="button" onClick={onReplayNotes} disabled={isPlaying}>
        {isPlaying ? 'Playing...' : 'Replay Correct Notes'}
      </button>
      <button type="button" onClick={onNextRound} disabled={isPlaying}>
        Next Round
      </button>
      <button type="button" onClick={onResetGame}>
        Reset Game
      </button>
    </div>
  ),
}));

const mockAudioEngine = audioEngine as any;

describe('MusicTestController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioEngine.isSupported.mockReturnValue(true);
    mockAudioEngine.generateNoteSet.mockReturnValue(['C4', 'E4', 'G4'] as Note[]);
    mockAudioEngine.playNotes.mockResolvedValue();
    mockAudioEngine.setVolume.mockImplementation();
    mockAudioEngine.stopNotes.mockImplementation();
  });

  describe('Initialization', () => {
    it('renders with default settings', () => {
      render(<MusicTestController />);

      expect(page.getByText('Music Note Identification')).toBeInTheDocument();
      expect(page.getByText('Score: 0/0')).toBeInTheDocument();
      expect(page.getByText('Difficulty: 3 notes')).toBeInTheDocument();
      expect(page.getByText('Start New Round')).toBeInTheDocument();
    });

    it('applies initial settings correctly', () => {
      render(<MusicTestController initialSettings={{ noteCount: 5, volume: 0.5 }} />);

      expect(page.getByText('Difficulty: 5 notes')).toBeInTheDocument();
      expect(mockAudioEngine.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('shows audio not supported message when audio is unavailable', () => {
      mockAudioEngine.isSupported.mockReturnValue(false);

      render(<MusicTestController />);

      expect(page.getByText('Audio Not Supported')).toBeInTheDocument();
      expect(page.getByText(/Your browser doesn't support the Web Audio API/)).toBeInTheDocument();
    });
  });

  describe('Game Flow', () => {
    it('starts new round when start button is clicked', async () => {
      render(<MusicTestController />);

      const startButton = page.getByText('Start New Round');
      await startButton.click();

      expect(mockAudioEngine.generateNoteSet).toHaveBeenCalledWith(3);
      expect(mockAudioEngine.playNotes).toHaveBeenCalledWith(['C4', 'E4', 'G4']);

      // Should show listening phase
      expect(page.getByText('Playing 3 notes...')).toBeInTheDocument();
    });

    it('allows difficulty selection in setup phase', async () => {
      render(<MusicTestController />);

      const difficultySelect = page.getByLabelText('Number of notes:');
      await difficultySelect.selectOptions('4');

      expect(page.getByText('Difficulty: 4 notes')).toBeInTheDocument();
    });

    it('integrates with DigitalStaff component', async () => {
      render(<MusicTestController />);

      const startButton = page.getByText('Start New Round');
      await startButton.click();

      // Wait for answering phase
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Verify DigitalStaff integration
      expect(page.getByTestId('digital-staff')).toBeInTheDocument();
      expect(page.getByTestId('max-notes')).toHaveTextContent('3');
      expect(page.getByTestId('show-correct')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
    it('handles audio playback errors gracefully', async () => {
      mockAudioEngine.playNotes.mockRejectedValue(new Error('Audio failed'));

      render(<MusicTestController />);

      const startButton = page.getByText('Start New Round');
      await startButton.click();

      // Wait for error to appear
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(page.getByText('Audio Error: Audio failed')).toBeInTheDocument();
      expect(page.getByText('Start New Round')).toBeInTheDocument(); // Back to setup
    });
  });

  describe('Answer Validation and Feedback', () => {
    it('validates correct answers and shows feedback', async () => {
      render(<MusicTestController />);

      // Start round
      const startButton = page.getByText('Start New Round');
      await startButton.click();

      // Wait for answering phase
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Select correct notes
      const selectC4 = page.getByTestId('select-note-C4');
      await selectC4.click();

      // Submit answer
      const submitButton = page.getByText('Submit Answer');
      await submitButton.click();

      // Verify feedback display appears
      expect(page.getByTestId('feedback-display')).toBeInTheDocument();
      expect(page.getByTestId('feedback-correct')).toHaveTextContent('false'); // Only selected 1 of 3 notes
    });

    it('shows validation result in DigitalStaff during feedback', async () => {
      render(<MusicTestController />);

      // Start round and submit answer
      const startButton = page.getByText('Start New Round');
      await startButton.click();
      await new Promise(resolve => setTimeout(resolve, 2200));

      const selectC4 = page.getByTestId('select-note-C4');
      await selectC4.click();

      const submitButton = page.getByText('Submit Answer');
      await submitButton.click();

      // Verify DigitalStaff receives validation result
      expect(page.getByTestId('validation-result')).toHaveTextContent('present');
      expect(page.getByTestId('show-correct')).toHaveTextContent('true');
    });

    it('updates score correctly for correct answers', async () => {
      // Mock a single note for easier testing
      mockAudioEngine.generateNoteSet.mockReturnValue(['C4'] as Note[]);

      render(<MusicTestController />);

      // Start round
      const startButton = page.getByText('Start New Round');
      await startButton.click();
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Select correct note
      const selectC4 = page.getByTestId('select-note-C4');
      await selectC4.click();

      // Submit answer
      const submitButton = page.getByText('Submit Answer');
      await submitButton.click();

      // Verify score updated
      expect(page.getByText('Score: 1/1')).toBeInTheDocument();
      expect(page.getByText('Accuracy: 100%')).toBeInTheDocument();
    });

    it('does not update score for incorrect answers', async () => {
      render(<MusicTestController />);

      // Start round
      const startButton = page.getByText('Start New Round');
      await startButton.click();
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Select only one note (incorrect since we need 3)
      const selectC4 = page.getByTestId('select-note-C4');
      await selectC4.click();

      // Submit answer
      const submitButton = page.getByText('Submit Answer');
      await submitButton.click();

      // Verify score not updated
      expect(page.getByText('Score: 0/1')).toBeInTheDocument();
      expect(page.getByText('Accuracy: 0%')).toBeInTheDocument();
    });

    it('resets validation result when starting new round', async () => {
      render(<MusicTestController />);

      // Complete a round
      const startButton = page.getByText('Start New Round');
      await startButton.click();
      await new Promise(resolve => setTimeout(resolve, 2200));

      const selectC4 = page.getByTestId('select-note-C4');
      await selectC4.click();

      const submitButton = page.getByText('Submit Answer');
      await submitButton.click();

      // Verify feedback is shown
      expect(page.getByTestId('feedback-display')).toBeInTheDocument();

      // Start new round
      const nextRoundButton = page.getByText('Next Round');
      await nextRoundButton.click();

      // Wait for new round to start
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Verify feedback is cleared and we're back to answering
      expect(page.queryByTestId('feedback-display')).not.toBeInTheDocument();
      expect(page.getByText('Submit Answer')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates AudioEngine and DigitalStaff correctly', async () => {
      render(<MusicTestController />);

      // Start round
      const startButton = page.getByText('Start New Round');
      await startButton.click();

      // Verify AudioEngine integration
      expect(mockAudioEngine.generateNoteSet).toHaveBeenCalledWith(3);
      expect(mockAudioEngine.playNotes).toHaveBeenCalledWith(['C4', 'E4', 'G4']);

      // Wait for answering phase
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Verify DigitalStaff integration
      expect(page.getByTestId('digital-staff')).toBeInTheDocument();
      expect(page.getByTestId('max-notes')).toHaveTextContent('3');
      expect(page.getByTestId('show-correct')).toHaveTextContent('false');
    });

    it('integrates FeedbackDisplay with validation results', async () => {
      render(<MusicTestController />);

      // Start round and submit answer
      const startButton = page.getByText('Start New Round');
      await startButton.click();
      await new Promise(resolve => setTimeout(resolve, 2200));

      const selectC4 = page.getByTestId('select-note-C4');
      await selectC4.click();

      const submitButton = page.getByText('Submit Answer');
      await submitButton.click();

      // Verify FeedbackDisplay integration
      expect(page.getByTestId('feedback-display')).toBeInTheDocument();
      expect(page.getByTestId('feedback-accuracy')).toHaveTextContent('33'); // 1/3 correct
    });
  });
});
