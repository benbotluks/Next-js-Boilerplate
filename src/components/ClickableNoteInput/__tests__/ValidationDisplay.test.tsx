import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ValidationDisplay, ValidationStats, getValidationStats } from '../components/ValidationDisplay';

describe('ValidationDisplay', () => {
  const defaultProps = {
    selectedNotes: ['C4', 'E4'] as const,
    correctNotes: ['C4', 'E4', 'G4'] as const,
    showCorrectAnswer: false,
  };

  it('renders validation message when showing correct answer', () => {
    render(<ValidationDisplay {...defaultProps} showCorrectAnswer />);
    
    // The message should appear and then auto-hide
    expect(screen.getByText(/correct notes/)).toBeInTheDocument();
  });

  it('shows success message for perfect score', () => {
    render(
      <ValidationDisplay 
        selectedNotes={['C4', 'E4', 'G4']}
        correctNotes={['C4', 'E4', 'G4']}
        showCorrectAnswer
      />
    );
    
    expect(screen.getByText('Perfect! All notes are correct.')).toBeInTheDocument();
  });

  it('shows error message for no correct notes', () => {
    render(
      <ValidationDisplay 
        selectedNotes={['F4', 'A4']}
        correctNotes={['C4', 'E4', 'G4']}
        showCorrectAnswer
      />
    );
    
    expect(screen.getByText('No correct notes selected')).toBeInTheDocument();
  });
});

describe('ValidationStats', () => {
  it('displays correct validation statistics', () => {
    render(
      <ValidationStats 
        selectedNotes={['C4', 'E4', 'F4']}
        correctNotes={['C4', 'E4', 'G4']}
      />
    );
    
    expect(screen.getByText('2/3')).toBeInTheDocument(); // Correct count
    expect(screen.getByText('Incorrect:')).toBeInTheDocument(); // Incorrect label
    expect(screen.getByText('Missing:')).toBeInTheDocument(); // Missing label
    expect(screen.getByText('67%')).toBeInTheDocument(); // Accuracy
  });
});

describe('getValidationStats', () => {
  it('calculates correct statistics', () => {
    const stats = getValidationStats(['C4', 'E4', 'F4'], ['C4', 'E4', 'G4']);
    
    expect(stats.correct).toBe(2);
    expect(stats.incorrect).toBe(1);
    expect(stats.missing).toBe(1);
    expect(stats.total).toBe(3);
    expect(stats.accuracy).toBeCloseTo(66.67, 1);
  });

  it('handles perfect score', () => {
    const stats = getValidationStats(['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']);
    
    expect(stats.correct).toBe(3);
    expect(stats.incorrect).toBe(0);
    expect(stats.missing).toBe(0);
    expect(stats.accuracy).toBe(100);
  });

  it('handles no correct notes', () => {
    const stats = getValidationStats(['F4', 'A4'], ['C4', 'E4', 'G4']);
    
    expect(stats.correct).toBe(0);
    expect(stats.incorrect).toBe(2);
    expect(stats.missing).toBe(3);
    expect(stats.accuracy).toBe(0);
  });
});