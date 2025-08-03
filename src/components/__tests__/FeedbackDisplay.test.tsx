import { page } from '@vitest/browser/context';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import type { ValidationResult } from '@/utils/AnswerValidation';
import FeedbackDisplay from '../FeedbackDisplay';

describe('FeedbackDisplay', () => {
  const mockOnReplayNotes = vi.fn();
  const mockOnNextRound = vi.fn();
  const mockOnResetGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Perfect Answer Feedback', () => {
    const perfectResult: ValidationResult = {
      isCorrect: true,
      correctNotes: ['C4', 'E4', 'G4'],
      selectedNotes: ['C4', 'E4', 'G4'],
      correctlyIdentified: ['C4', 'E4', 'G4'],
      missedNotes: [],
      incorrectNotes: [],
      accuracy: 100,
    };

    it('displays correct feedback for perfect answer', () => {
      render(
        <FeedbackDisplay
          validationResult={perfectResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Correct!')).toBeInTheDocument();
      expect(page.getByText('100% Accuracy')).toBeInTheDocument();
      expect(page.getByText('Perfect! You identified all notes correctly.')).toBeInTheDocument();
    });

    it('shows correct notes with green styling', () => {
      render(
        <FeedbackDisplay
          validationResult={perfectResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('C4')).toBeInTheDocument();
      expect(page.getByText('E4')).toBeInTheDocument();
      expect(page.getByText('G4')).toBeInTheDocument();
    });

    it('shows all selected notes with correct styling', () => {
      render(
        <FeedbackDisplay
          validationResult={perfectResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      // All notes should be shown under "Your Answer" section
      const yourAnswerSection = page.getByText('Your Answer:').parentElement;
      expect(yourAnswerSection).toBeInTheDocument();
    });

    it('does not show missed notes section for perfect answer', () => {
      render(
        <FeedbackDisplay
          validationResult={perfectResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.queryByText('Missed Notes:')).not.toBeInTheDocument();
    });
  });

  describe('Partial Answer Feedback', () => {
    const partialResult: ValidationResult = {
      isCorrect: false,
      correctNotes: ['C4', 'E4', 'G4'],
      selectedNotes: ['C4', 'E4'],
      correctlyIdentified: ['C4', 'E4'],
      missedNotes: ['G4'],
      incorrectNotes: [],
      accuracy: 67,
    };

    it('displays incorrect feedback for partial answer', () => {
      render(
        <FeedbackDisplay
          validationResult={partialResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Incorrect')).toBeInTheDocument();
      expect(page.getByText('67% Accuracy')).toBeInTheDocument();
      expect(page.getByText('You correctly identified 2 out of 3 notes. You missed: G4.')).toBeInTheDocument();
    });

    it('shows missed notes section', () => {
      render(
        <FeedbackDisplay
          validationResult={partialResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Missed Notes:')).toBeInTheDocument();
      expect(page.getByText('G4')).toBeInTheDocument();
    });

    it('shows missed indicator in legend', () => {
      render(
        <FeedbackDisplay
          validationResult={partialResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Missed')).toBeInTheDocument();
    });
  });

  describe('Incorrect Answer Feedback', () => {
    const incorrectResult: ValidationResult = {
      isCorrect: false,
      correctNotes: ['C4', 'E4', 'G4'],
      selectedNotes: ['C4', 'F4', 'A4'],
      correctlyIdentified: ['C4'],
      missedNotes: ['E4', 'G4'],
      incorrectNotes: ['A4', 'F4'],
      accuracy: 33,
    };

    it('displays feedback for mixed correct/incorrect answer', () => {
      render(
        <FeedbackDisplay
          validationResult={incorrectResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Incorrect')).toBeInTheDocument();
      expect(page.getByText('33% Accuracy')).toBeInTheDocument();
      expect(page.getByText(/You correctly identified 1 out of 3 notes/)).toBeInTheDocument();
      expect(page.getByText(/You missed: E4, G4/)).toBeInTheDocument();
      expect(page.getByText(/Incorrect selections: A4, F4/)).toBeInTheDocument();
    });

    it('shows both missed and incorrect notes sections', () => {
      render(
        <FeedbackDisplay
          validationResult={incorrectResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Missed Notes:')).toBeInTheDocument();
      expect(page.getByText('Missed')).toBeInTheDocument(); // In legend
    });
  });

  describe('Empty Answer Feedback', () => {
    const emptyResult: ValidationResult = {
      isCorrect: false,
      correctNotes: ['C4', 'E4', 'G4'],
      selectedNotes: [],
      correctlyIdentified: [],
      missedNotes: ['C4', 'E4', 'G4'],
      incorrectNotes: [],
      accuracy: 0,
    };

    it('handles empty selection gracefully', () => {
      render(
        <FeedbackDisplay
          validationResult={emptyResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(page.getByText('Incorrect')).toBeInTheDocument();
      expect(page.getByText('0% Accuracy')).toBeInTheDocument();
      expect(page.getByText('No notes selected')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    const testResult: ValidationResult = {
      isCorrect: true,
      correctNotes: ['C4'],
      selectedNotes: ['C4'],
      correctlyIdentified: ['C4'],
      missedNotes: [],
      incorrectNotes: [],
      accuracy: 100,
    };

    it('calls replay notes handler when replay button is clicked', async () => {
      render(
        <FeedbackDisplay
          validationResult={testResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      const replayButton = page.getByText('Replay Correct Notes');
      await replayButton.click();

      expect(mockOnReplayNotes).toHaveBeenCalledOnce();
    });

    it('calls next round handler when next round button is clicked', async () => {
      render(
        <FeedbackDisplay
          validationResult={testResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      const nextButton = page.getByText('Next Round');
      await nextButton.click();

      expect(mockOnNextRound).toHaveBeenCalledOnce();
    });

    it('calls reset game handler when reset button is clicked', async () => {
      render(
        <FeedbackDisplay
          validationResult={testResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
        />,
      );

      const resetButton = page.getByText('Reset Game');
      await resetButton.click();

      expect(mockOnResetGame).toHaveBeenCalledOnce();
    });

    it('disables buttons when audio is playing', () => {
      render(
        <FeedbackDisplay
          validationResult={testResult}
          onReplayNotes={mockOnReplayNotes}
          onNextRound={mockOnNextRound}
          onResetGame={mockOnResetGame}
          isPlaying={true}
        />,
      );

      const replayButton = page.getByText('Playing...');
      const nextButton = page.getByText('Next Round');

      expect(replayButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('renders without optional handlers', () => {
      render(<FeedbackDisplay validationResult={testResult} />);

      expect(page.queryByText('Replay Correct Notes')).not.toBeInTheDocument();
      expect(page.queryByText('Next Round')).not.toBeInTheDocument();
      expect(page.queryByText('Reset Game')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    const testResult: ValidationResult = {
      isCorrect: false,
      correctNotes: ['C4', 'E4'],
      selectedNotes: ['C4', 'F4'],
      correctlyIdentified: ['C4'],
      missedNotes: ['E4'],
      incorrectNotes: ['F4'],
      accuracy: 50,
    };

    it('applies custom className', () => {
      render(
        <FeedbackDisplay
          validationResult={testResult}
          className="custom-class"
        />,
      );

      const container = page.getByText('Incorrect').closest('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('shows legend with all relevant colors', () => {
      render(<FeedbackDisplay validationResult={testResult} />);

      expect(page.getByText('Legend:')).toBeInTheDocument();
      expect(page.getByText('Correct')).toBeInTheDocument();
      expect(page.getByText('Incorrect')).toBeInTheDocument();
      expect(page.getByText('Missed')).toBeInTheDocument();
    });
  });
});