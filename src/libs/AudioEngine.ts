import type { Note } from '@/types/MusicTypes';
import { AVAILABLE_NOTES, NOTE_FREQUENCIES } from '@/utils/MusicConstants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private volume = 0.7;
  private isInitialized = false;

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Initialize the Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      // Check for Web Audio API support
      if (!this.isSupported()) {
        console.warn('Web Audio API is not supported in this browser');
        return;
      }

      // Create audio context (will be resumed on first user interaction)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create master gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.audioContext = null;
      this.gainNode = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if Web Audio API is supported
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false; // Server-side environment
    }
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  /**
   * Resume audio context if it's suspended (required for user interaction)
   */
  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
        throw new Error('Audio context could not be resumed');
      }
    }
  }

  /**
   * Convert note names to frequencies
   */
  private getFrequency(note: Note): number {
    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) {
      throw new Error(`Invalid note: ${note}`);
    }
    return frequency;
  }

  /**
   * Generate a random set of notes for the game
   */
  public generateNoteSet(count: number): Note[] {
    if (count < 2 || count > 6) {
      throw new Error('Note count must be between 2 and 6');
    }

    // Shuffle available notes and take the first 'count' notes
    const shuffled = [...AVAILABLE_NOTES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Play multiple notes simultaneously
   */
  public async playNotes(notes: Note[]): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      throw new Error('Audio engine is not initialized');
    }

    if (notes.length === 0) {
      throw new Error('At least one note must be provided');
    }

    // Stop any currently playing notes
    this.stopNotes();

    try {
      // Resume audio context if needed
      await this.resumeAudioContext();

      // Create oscillators for each note
      this.oscillators = notes.map((note) => {
        const oscillator = this.audioContext!.createOscillator();
        const frequency = this.getFrequency(note);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);

        // Connect to gain node
        oscillator.connect(this.gainNode!);

        return oscillator;
      });

      // Start all oscillators simultaneously
      const startTime = this.audioContext.currentTime;
      this.oscillators.forEach((oscillator) => {
        oscillator.start(startTime);
      });

      // Schedule stop after 2 seconds
      const stopTime = startTime + 2.0;
      this.oscillators.forEach((oscillator) => {
        oscillator.stop(stopTime);
      });

      // Clean up oscillators after they stop
      setTimeout(() => {
        this.oscillators = [];
      }, 2100);
    } catch (error) {
      console.error('Failed to play notes:', error);
      this.stopNotes();

      // Preserve specific error messages for better debugging
      if (error instanceof Error) {
        if (error.message.includes('Invalid note:')) {
          throw error; // Re-throw note validation errors as-is
        }
        if (error.message.includes('Audio context could not be resumed')) {
          throw error; // Re-throw audio context errors as-is
        }
      }

      throw new Error('Failed to play audio');
    }
  }

  /**
   * Play notes by frequency values
   */
  public async playFrequencies(frequencies: number[]): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      throw new Error('Audio engine is not initialized');
    }

    if (frequencies.length === 0) {
      throw new Error('At least one frequency must be provided');
    }

    // Stop any currently playing notes
    this.stopNotes();

    try {
      // Resume audio context if needed
      await this.resumeAudioContext();

      // Create oscillators for each frequency
      this.oscillators = frequencies.map((frequency) => {
        const oscillator = this.audioContext!.createOscillator();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);

        // Connect to gain node
        oscillator.connect(this.gainNode!);

        return oscillator;
      });

      // Start all oscillators simultaneously
      const startTime = this.audioContext.currentTime;
      this.oscillators.forEach((oscillator) => {
        oscillator.start(startTime);
      });

      // Schedule stop after 2 seconds
      const stopTime = startTime + 2.0;
      this.oscillators.forEach((oscillator) => {
        oscillator.stop(stopTime);
      });

      // Clean up oscillators after they stop
      setTimeout(() => {
        this.oscillators = [];
      }, 2100);
    } catch (error) {
      console.error('Failed to play frequencies:', error);
      this.stopNotes();
      throw new Error('Failed to play audio');
    }
  }

  /**
   * Stop all currently playing notes
   */
  public stopNotes(): void {
    this.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (error) {
        console.error('Failed to stop notes:', error);
        throw new Error('Failed to stop audio');
        // Oscillator might already be stopped, ignore error
      }
    });
    this.oscillators = [];
  }

  /**
   * Set the volume (0-1)
   */
  public setVolume(volume: number): void {
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }

    this.volume = volume;

    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Get audio context state
   */
  public getAudioContextState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }

  /**
   * Dispose of the audio engine and clean up resources
   */
  public dispose(): void {
    this.stopNotes();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.gainNode = null;
    this.isInitialized = false;
  }
}

// Export a singleton instance
export const audioEngine = new AudioEngine();
