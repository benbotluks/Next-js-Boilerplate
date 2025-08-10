import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import MusicTestController from '../MusicTest/MusicTestController';

// Mock the AudioEngine
vi.mock('@/libs/AudioEngine', () => ({
  audioEngine: {
    isSupported: vi.fn(() => true),
    setVolume: vi.fn(),
    generateNoteSet: vi.fn(() => ['C4', 'E4', 'G4']),
    playNotes: vi.fn(() => Promise.resolve()),
    stopNotes: vi.fn(),
  },
}));

// Mock the DigitalStaff component
vi.mock('../DigitalStaff', () => ({
  default: () => <div data-testid="digital-staff">Mock Digital Staff</div>,
}));

describe('MusicTestController', () => {
  describe('Basic Rendering', () => {
    it('renders the main title', () => {
      render(<MusicTestController />);

      expect(page.getByText('Music Note Identification')).toBeInTheDocument();
    });

    it('shows initial game state', () => {
      render(<MusicTestController />);

      expect(page.getByText('Score:')).toBeInTheDocument();
      expect(page.getByText('Difficulty:')).toBeInTheDocument();
      expect(page.getByRole('button', { name: 'Start New Round' })).toBeInTheDocument();
    });

    it('applies initial settings', () => {
      render(<MusicTestController initialSettings={{ noteCount: 5 }} />);

      expect(page.getByText('Difficulty:')).toBeInTheDocument();
      expect(page.getByRole('option', { name: '5' })).toBeInTheDocument();
    });
  });
});
