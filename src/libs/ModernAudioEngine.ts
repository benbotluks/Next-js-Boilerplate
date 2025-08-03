import type { Note } from '@/types/MusicTypes';
import * as Tone from 'tone';
import { AVAILABLE_NOTES, MusicTheoryUtils } from '@/utils/MusicTheoryUtils';

/**
 * Modern audio engine using Tone.js for reliable audio synthesis
 * Maintains exact same interface as the original AudioEngine for drop-in replacement
 */
export class ModernAudioEngine {
  private synths: Tone.Synth[] = [];
  private volume = 0.7;
  private isInitialized = false;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize Tone.js audio system
   */
  private initializeAudio(): void {
    try {
      // Check for Web Audio API support
      if (!this.isSupported()) {
        console.warn('Web Audio API is not supported in this browser');
        return;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Convert linear volume (0-1) to decibels for Tone.js
   */
  private volumeToDecibels(volume: number): number {
    if (volume <= 0) {
      return -Infinity;
    }
    return 20 * Math.log10(volume);
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
   * Ensure audio context is started (required for user interaction)
   */
  private async startAudioContext(): Promise<void> {
    if (Tone.getContext().state !== 'running') {
      try {
        await Tone.start();
      } catch (error) {
        console.error('Failed to start audio context:', error);
        throw new Error('Audio context could not be resumed');
      }
    }
  }

  /**
   * Generate a random set of notes for the game
   */
  public generateNoteSet(count: number): Note[] {
    if (count < 2 || count > 6) {
      throw new Error('Note count must be between 2 and 6');
    }

    return MusicTheoryUtils.getRandomNoteSet(count, AVAILABLE_NOTES);
  }

  /**
   * Play multiple notes simultaneously
   */
  public async playNotes(notes: Note[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Audio engine is not initialized');
    }

    if (notes.length === 0) {
      throw new Error('At least one note must be provided');
    }

    // Stop any currently playing notes
    this.stopNotes();

    try {
      // Start audio context if needed
      await this.startAudioContext();

      // Validate all notes before playing
      for (const note of notes) {
        if (!MusicTheoryUtils.isValidNote(note)) {
          throw new Error(`Invalid note: ${note}`);
        }
      }

      // Create a synth for each note and play them simultaneously
      const now = Tone.now();

      this.synths = notes.map((note) => {
        const synth = new Tone.Synth().toDestination();
        synth.volume.value = this.volumeToDecibels(this.volume);

        // Trigger attack immediately and release after 2 seconds
        synth.triggerAttack(note, now);
        synth.triggerRelease(now + 2);

        return synth;
      });

      // Clean up synths after playback completes
      setTimeout(() => {
        this.synths.forEach(synth => synth.dispose());
        this.synths = [];
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
    if (!this.isInitialized) {
      throw new Error('Audio engine is not initialized');
    }

    if (frequencies.length === 0) {
      throw new Error('At least one frequency must be provided');
    }

    // Stop any currently playing notes
    this.stopNotes();

    try {
      // Start audio context if needed
      await this.startAudioContext();

      // Create a synth for each frequency and play them simultaneously
      const now = Tone.now();

      this.synths = frequencies.map((frequency) => {
        const synth = new Tone.Synth().toDestination();
        synth.volume.value = this.volumeToDecibels(this.volume);

        // Convert frequency to note name for Tone.js
        const noteName = Tone.Frequency(frequency).toNote();

        // Trigger attack immediately and release after 2 seconds
        synth.triggerAttack(noteName, now);
        synth.triggerRelease(now + 2);

        return synth;
      });

      // Clean up synths after playback completes
      setTimeout(() => {
        this.synths.forEach(synth => synth.dispose());
        this.synths = [];
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
    this.synths.forEach((synth) => {
      try {
        synth.triggerRelease();
        synth.dispose();
      } catch (error) {
        // Ignore errors when stopping - synth might already be disposed
        console.error('Failed to stop notes:', error);
      }
    });
    this.synths = [];
  }

  /**
   * Set the volume (0-1)
   */
  public setVolume(volume: number): void {
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }

    this.volume = volume;

    // Update volume for all active synths
    this.synths.forEach((synth) => {
      synth.volume.value = this.volumeToDecibels(volume);
    });
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
    if (typeof window === 'undefined') {
      return null;
    }
    return Tone.getContext().state as AudioContextState;
  }

  /**
   * Dispose of the audio engine and clean up resources
   */
  public dispose(): void {
    this.stopNotes();
    this.isInitialized = false;
  }
}

// Export a singleton instance
export const modernAudioEngine = new ModernAudioEngine();
