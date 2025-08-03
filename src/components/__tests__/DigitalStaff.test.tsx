import type { Note } from '@/types/MusicTypes';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DigitalStaff from '../DigitalStaff';

// Mock the SVG rendering for node environment
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
  };
});

describe('DigitalStaff', () => {
  const mockOnNoteSelect = vi.fn();
  const mockOnNoteDeselect = vi.fn();

  const defaultProps = {
    selectedNotes: [] as Note[],
    onNoteSelect: mockOnNoteSelect,
    onNoteDeselect: mockOnNoteDeselect,
    maxNotes: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Staff Rendering', () => {
    it('renders the treble clef staff with 5 lines', () => {
      render(<DigitalStaff {...defaultProps} />);

      const svg = screen.getByRole('img', { hidden: true });

      expect(svg).toBeInTheDocument();

      // Check for staff lines (5 lines in treble clef)
      const lines = svg.querySelectorAll('line[stroke="#000"][stroke-width="1"]');

      expect(lines).toHaveLength(5);
    });

    it('displays the treble clef symbol', () => {
      render(<DigitalStaff {...defaultProps} />);

      const trebleClef = screen.getByText('𝄞');

      expect(trebleClef).toBeInTheDocument();
    });

    it('shows note count indicator', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4', 'E4']} />);

      expect(screen.getByText('Selected: 2/3 notes')).toBeInTheDocument();
    });

    it('displays maximum reached warning when note limit is reached', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4', 'E4', 'G4']} />);

      expect(screen.getByText(/Maximum reached/)).toBeInTheDocument();
    });
  });

  describe('Note Selection', () => {
    it('calls onNoteSelect when clicking an unselected note', () => {
      render(<DigitalStaff {...defaultProps} />);

      // Find and click a note position (C4)
      const svg = screen.getByRole('img', { hidden: true });
      const noteCircles = svg.querySelectorAll('circle[fill="transparent"]');

      fireEvent.click(noteCircles[0]); // Click first note (C4)

      expect(mockOnNoteSelect).toHaveBeenCalledWith('C4');
      expect(mockOnNoteSelect).toHaveBeenCalledTimes(1);
    });

    it('calls onNoteDeselect when clicking a selected note', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4']} />);

      const svg = screen.getByRole('img', { hidden: true });
      const noteCircles = svg.querySelectorAll('circle[fill="transparent"]');

      fireEvent.click(noteCircles[0]); // Click C4 again to deselect

      expect(mockOnNoteDeselect).toHaveBeenCalledWith('C4');
      expect(mockOnNoteDeselect).toHaveBeenCalledTimes(1);
    });

    it('prevents selection when maximum notes are reached', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4', 'E4', 'G4']} />);

      const svg = screen.getByRole('img', { hidden: true });
      const noteCircles = svg.querySelectorAll('circle[fill="transparent"]');

      // Try to click a different note (D4)
      fireEvent.click(noteCircles[1]);

      expect(mockOnNoteSelect).not.toHaveBeenCalled();
    });

    it('allows deselection even when maximum notes are reached', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4', 'E4', 'G4']} />);

      const svg = screen.getByRole('img', { hidden: true });
      const noteCircles = svg.querySelectorAll('circle[fill="transparent"]');

      // Click on a selected note to deselect it
      fireEvent.click(noteCircles[0]); // C4

      expect(mockOnNoteDeselect).toHaveBeenCalledWith('C4');
    });
  });

  describe('Visual Feedback', () => {
    it('displays selected notes with note heads and stems', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4', 'E4']} />);

      const svg = screen.getByRole('img', { hidden: true });

      // Check for note heads (ellipses)
      const noteHeads = svg.querySelectorAll('ellipse[fill="#3b82f6"]');

      expect(noteHeads).toHaveLength(2);

      // Check for note stems (lines)
      const noteStems = svg.querySelectorAll('line[stroke="#3b82f6"]');

      expect(noteStems).toHaveLength(2);
    });

    it('shows accidentals for sharp notes', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C#4', 'F#4']} />);

      const sharpSymbols = screen.getAllByText('♯');

      expect(sharpSymbols).toHaveLength(2);
    });

    it('displays ledger lines for notes that require them', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4']} />); // C4 requires ledger line

      const svg = screen.getByRole('img', { hidden: true });
      const ledgerLines = svg.querySelectorAll('line[stroke="#000"][stroke-width="1"]');

      // Should have 5 staff lines + 1 ledger line
      expect(ledgerLines.length).toBeGreaterThan(5);
    });
  });

  describe('Correct Answer Display', () => {
    it('shows correct notes in green when showCorrectAnswer is true', () => {
      render(
        <DigitalStaff
          {...defaultProps}
          selectedNotes={['C4', 'E4']}
          showCorrectAnswer={true}
          correctNotes={['C4', 'G4']}
        />,
      );

      const svg = screen.getByRole('img', { hidden: true });

      // C4 should be green (correct and selected)
      const greenNotes = svg.querySelectorAll('ellipse[fill="#22c55e"]');

      expect(greenNotes.length).toBeGreaterThan(0);

      // E4 should be red (incorrect - selected but not in correct notes)
      const redNotes = svg.querySelectorAll('ellipse[fill="#ef4444"]');

      expect(redNotes.length).toBeGreaterThan(0);
    });

    it('displays feedback legend when showing correct answers', () => {
      render(
        <DigitalStaff
          {...defaultProps}
          showCorrectAnswer={true}
          correctNotes={['C4']}
        />,
      );

      expect(screen.getByText('Green: Correct')).toBeInTheDocument();
      expect(screen.getByText('Red: Incorrect')).toBeInTheDocument();
    });
  });

  describe('Note Positioning', () => {
    it('renders all available notes in the correct range', () => {
      render(<DigitalStaff {...defaultProps} />);

      // Check that note labels are present for the expected range
      const expectedNotes = [
        'C4',
        'D4',
        'E4',
        'F4',
        'G4',
        'A4',
        'B4',
        'C5',
        'D5',
        'E5',
        'F5',
        'G5',
        'A5',
        'B5',
      ];

      expectedNotes.forEach((note) => {
        expect(screen.getByText(note)).toBeInTheDocument();
      });
    });

    it('positions notes at correct staff positions', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['E4', 'G4', 'B4']} />);

      const svg = screen.getByRole('img', { hidden: true });
      const noteHeads = svg.querySelectorAll('ellipse');

      // Should have 3 note heads for the selected notes
      expect(noteHeads).toHaveLength(3);

      // Each note head should have different y positions
      const yPositions = Array.from(noteHeads).map(note => note.getAttribute('cy'));
      const uniqueYPositions = new Set(yPositions);

      expect(uniqueYPositions.size).toBe(3); // All different positions
    });
  });

  describe('Accessibility and Usability', () => {
    it('provides note labels for accessibility', () => {
      render(<DigitalStaff {...defaultProps} />);

      // Check that note labels are present and readable
      expect(screen.getByText('C4')).toBeInTheDocument();
      expect(screen.getByText('E4')).toBeInTheDocument();
      expect(screen.getByText('G4')).toBeInTheDocument();
    });

    it('shows helpful instructions', () => {
      render(<DigitalStaff {...defaultProps} />);

      expect(screen.getByText(/Click on the staff positions to select notes/)).toBeInTheDocument();
    });

    it('applies correct cursor styles based on selection state', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={['C4', 'E4', 'G4']} />);

      const svg = screen.getByRole('img', { hidden: true });
      const clickableAreas = svg.querySelectorAll('circle[fill="transparent"]');

      // First three should allow deselection (cursor-pointer)
      expect(clickableAreas[0]).toHaveClass('cursor-pointer');

      // Others should show not-allowed when max is reached
      expect(clickableAreas[3]).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty selected notes array', () => {
      render(<DigitalStaff {...defaultProps} selectedNotes={[]} />);

      expect(screen.getByText('Selected: 0/3 notes')).toBeInTheDocument();

      const svg = screen.getByRole('img', { hidden: true });
      const noteHeads = svg.querySelectorAll('ellipse');

      expect(noteHeads).toHaveLength(0);
    });

    it('handles maxNotes of 1', () => {
      render(<DigitalStaff {...defaultProps} maxNotes={1} selectedNotes={['C4']} />);

      expect(screen.getByText('Selected: 1/1 notes')).toBeInTheDocument();
      expect(screen.getByText(/Maximum reached/)).toBeInTheDocument();
    });

    it('handles maxNotes of 6', () => {
      const sixNotes: Note[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
      render(<DigitalStaff {...defaultProps} maxNotes={6} selectedNotes={sixNotes} />);

      expect(screen.getByText('Selected: 6/6 notes')).toBeInTheDocument();

      const svg = screen.getByRole('img', { hidden: true });
      const noteHeads = svg.querySelectorAll('ellipse');

      expect(noteHeads).toHaveLength(6);
    });

    it('handles invalid notes gracefully', () => {
      // This test ensures the component doesn't crash with invalid note data
      const invalidNote = 'X4' as Note;
      render(<DigitalStaff {...defaultProps} selectedNotes={[invalidNote]} />);

      // Component should still render without crashing
      expect(screen.getByText('Selected: 1/3 notes')).toBeInTheDocument();
    });
  });
});
