import type { Note } from '@/types/MusicTypes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioEngine } from '../AudioEngine';

// Mock Web Audio API
const mockOscillator = {
  type: 'sine',
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    value: 0.7,
    setValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  state: 'running' as AudioContextState,
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGainNode })),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
};

// Mock global AudioContext and window
const originalAudioContext = global.AudioContext;
const originalWebkitAudioContext = (global as any).webkitAudioContext;
const originalWindow = global.window;

describe('AudioEngine', () => {
  let audioEngine: AudioEngine;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock window object
    global.window = {
      AudioContext: vi.fn(() => mockAudioContext) as any,
      webkitAudioContext: vi.fn(() => mockAudioContext) as any,
    } as any;

    // Mock AudioContext
    global.AudioContext = vi.fn(() => mockAudioContext) as any;
    (global as any).webkitAudioContext = vi.fn(() => mockAudioContext) as any;

    // Reset mock state
    mockAudioContext.state = 'running';
    mockAudioContext.currentTime = 0;
    mockGainNode.gain.value = 0.7;

    audioEngine = new AudioEngine();
  });

  afterEach(() => {
    audioEngine.dispose();

    // Restore original AudioContext and window
    global.AudioContext = originalAudioContext;
    (global as any).webkitAudioContext = originalWebkitAudioContext;
    global.window = originalWindow;
  });

  describe('constructor and initialization', () => {
    it('should initialize with Web Audio API support', () => {
      expect(audioEngine.isSupported()).toBe(true);
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it('should handle missing Web Audio API gracefully', () => {
      // Remove AudioContext support from window
      global.window = {} as any;

      const engineWithoutSupport = new AudioEngine();

      expect(engineWithoutSupport.isSupported()).toBe(false);

      // Restore for cleanup
      global.window = {
        AudioContext: vi.fn(() => mockAudioContext) as any,
        webkitAudioContext: vi.fn(() => mockAudioContext) as any,
      } as any;
    });

    it('should handle AudioContext creation failure', async () => {
      global.window = {
        AudioContext: vi.fn(() => {
          throw new Error('AudioContext creation failed');
        }) as any,
        webkitAudioContext: undefined,
      } as any;

      const engineWithError = new AudioEngine();

      expect(engineWithError.isSupported()).toBe(true); // Support check passes, but init fails

      // Should throw when trying to play
      await expect(engineWithError.playNotes(['C4'])).rejects.toThrow('Audio engine is not initialized');
    });
  });

  describe('isSupported', () => {
    it('should return true when AudioContext is available', () => {
      expect(audioEngine.isSupported()).toBe(true);
    });

    it('should return true when webkitAudioContext is available', () => {
      global.window = {
        AudioContext: undefined,
        webkitAudioContext: vi.fn(() => mockAudioContext) as any,
      } as any;

      expect(audioEngine.isSupported()).toBe(true);
    });

    it('should return false when no audio context is available', () => {
      global.window = {} as any;

      expect(audioEngine.isSupported()).toBe(false);
    });
  });

  describe('generateNoteSet', () => {
    it('should generate the correct number of notes', () => {
      const notes = audioEngine.generateNoteSet(3);

      expect(notes).toHaveLength(3);
      expect(notes.every(note => typeof note === 'string')).toBe(true);
    });

    it('should generate unique notes', () => {
      const notes = audioEngine.generateNoteSet(5);
      const uniqueNotes = new Set(notes);

      expect(uniqueNotes.size).toBe(5);
    });

    it('should throw error for invalid count', () => {
      expect(() => audioEngine.generateNoteSet(1)).toThrow('Note count must be between 2 and 6');
      expect(() => audioEngine.generateNoteSet(7)).toThrow('Note count must be between 2 and 6');
    });

    it('should generate different note sets on multiple calls', () => {
      const notes1 = audioEngine.generateNoteSet(4);
      const notes2 = audioEngine.generateNoteSet(4);

      // While it's possible they could be the same due to randomness,
      // it's extremely unlikely with proper shuffling
      const areIdentical = notes1.length === notes2.length
        && notes1.every((note, index) => note === notes2[index]);

      // Run multiple times to reduce chance of false positive
      let differentFound = !areIdentical;
      for (let i = 0; i < 10 && !differentFound; i++) {
        const testNotes = audioEngine.generateNoteSet(4);
        differentFound = !notes1.every((note, index) => note === testNotes[index]);
      }

      expect(differentFound).toBe(true);
    });
  });

  describe('playNotes', () => {
    const testNotes: Note[] = ['C4', 'E4', 'G4'];

    it('should create oscillators for each note', async () => {
      await audioEngine.playNotes(testNotes);

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledTimes(3);
      expect(mockOscillator.connect).toHaveBeenCalledTimes(3);
      expect(mockOscillator.start).toHaveBeenCalledTimes(3);
    });

    it('should set correct frequencies for notes', async () => {
      await audioEngine.playNotes(['C4']);

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(261.63, 0);
    });

    it('should resume audio context if suspended', async () => {
      mockAudioContext.state = 'suspended';

      await audioEngine.playNotes(testNotes);

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should throw error for empty note array', async () => {
      await expect(audioEngine.playNotes([])).rejects.toThrow('At least one note must be provided');
    });

    it('should throw error for invalid note', async () => {
      await expect(audioEngine.playNotes(['X4' as Note])).rejects.toThrow('Invalid note: X4');
    });

    it('should stop previous notes before playing new ones', async () => {
      // Play first set of notes
      await audioEngine.playNotes(['C4']);
      const firstStopCall = mockOscillator.stop;

      // Play second set of notes
      await audioEngine.playNotes(['D4']);

      expect(firstStopCall).toHaveBeenCalled();
    });

    it('should handle audio context resume failure', async () => {
      mockAudioContext.state = 'suspended';
      mockAudioContext.resume.mockRejectedValueOnce(new Error('Resume failed'));

      await expect(audioEngine.playNotes(testNotes)).rejects.toThrow('Audio context could not be resumed');
    });
  });

  describe('playFrequencies', () => {
    const testFrequencies = [261.63, 329.63, 392.00]; // C4, E4, G4

    it('should create oscillators for each frequency', async () => {
      await audioEngine.playFrequencies(testFrequencies);

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledTimes(3);
      expect(mockOscillator.connect).toHaveBeenCalledTimes(3);
      expect(mockOscillator.start).toHaveBeenCalledTimes(3);
    });

    it('should set correct frequencies', async () => {
      await audioEngine.playFrequencies([440.00]); // A4

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440.00, 0);
    });

    it('should throw error for empty frequency array', async () => {
      await expect(audioEngine.playFrequencies([])).rejects.toThrow('At least one frequency must be provided');
    });
  });

  describe('stopNotes', () => {
    it('should stop all oscillators', async () => {
      await audioEngine.playNotes(['C4', 'E4']);

      audioEngine.stopNotes();

      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('should handle oscillator stop errors gracefully', async () => {
      await audioEngine.playNotes(['C4']);

      // Mock oscillator.stop to throw error
      mockOscillator.stop.mockImplementationOnce(() => {
        throw new Error('Already stopped');
      });

      expect(() => audioEngine.stopNotes()).not.toThrow();
    });
  });

  describe('volume control', () => {
    it('should set volume correctly', () => {
      audioEngine.setVolume(0.5);

      expect(audioEngine.getVolume()).toBe(0.5);
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
    });

    it('should throw error for invalid volume', () => {
      expect(() => audioEngine.setVolume(-0.1)).toThrow('Volume must be between 0 and 1');
      expect(() => audioEngine.setVolume(1.1)).toThrow('Volume must be between 0 and 1');
    });

    it('should return current volume', () => {
      audioEngine.setVolume(0.8);

      expect(audioEngine.getVolume()).toBe(0.8);
    });
  });

  describe('getAudioContextState', () => {
    it('should return audio context state', () => {
      expect(audioEngine.getAudioContextState()).toBe('running');
    });

    it('should return null when audio context is not available', () => {
      audioEngine.dispose();

      expect(audioEngine.getAudioContextState()).toBe(null);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      audioEngine.dispose();

      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(audioEngine.getAudioContextState()).toBe(null);
    });

    it('should stop notes before disposing', async () => {
      await audioEngine.playNotes(['C4']);

      audioEngine.dispose();

      expect(mockOscillator.stop).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when trying to play without initialization', async () => {
      // Create engine that fails to initialize
      global.window = {
        AudioContext: vi.fn(() => {
          throw new Error('Init failed');
        }) as any,
        webkitAudioContext: undefined,
      } as any;

      const failedEngine = new AudioEngine();

      await expect(failedEngine.playNotes(['C4'])).rejects.toThrow('Audio engine is not initialized');
    });

    it('should handle oscillator creation failure', async () => {
      mockAudioContext.createOscillator.mockImplementationOnce(() => {
        throw new Error('Oscillator creation failed');
      });

      await expect(audioEngine.playNotes(['C4'])).rejects.toThrow('Failed to play audio');
    });
  });
});
