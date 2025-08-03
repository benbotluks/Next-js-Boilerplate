# Design Document

## Overview

This design outlines the modernization of the music note identification application by replacing custom audio and notation implementations with established libraries: Tone.js for audio synthesis, VexFlow for music notation rendering, and Tonal for music theory utilities.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    MusicTestController                      │
│  (Orchestrates game logic, unchanged interface)            │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
    ┌─────────────▼─────────────┐  ┌──────▼──────────────────┐
    │     ModernAudioEngine     │  │   ModernDigitalStaff    │
    │     (Tone.js wrapper)     │  │   (VexFlow wrapper)     │
    └─────────────┬─────────────┘  └──────┬──────────────────┘
                  │                       │
    ┌─────────────▼─────────────┐  ┌──────▼──────────────────┐
    │        Tone.js            │  │       VexFlow           │
    │   (Audio synthesis)       │  │  (Music notation)       │
    └───────────────────────────┘  └─────────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │         Tonal             │
    │   (Music theory utils)    │
    └───────────────────────────┘
```

## Components and Interfaces

### 1. ModernAudioEngine (replaces AudioEngine.ts)

**Purpose:** Wrapper around Tone.js providing the same interface as the original AudioEngine

**Key Design Decisions:**
- Maintain identical public API to minimize breaking changes
- Use Tone.js Synth for note generation instead of raw oscillators
- Leverage Tone.js Transport for precise timing
- Use Tonal for note frequency calculations

**Interface:**
```typescript
export class ModernAudioEngine {
  // Maintain existing interface
  isSupported(): boolean;
  generateNoteSet(count: number): Note[];
  playNotes(notes: Note[]): Promise<void>;
  playFrequencies(frequencies: number[]): Promise<void>;
  stopNotes(): void;
  setVolume(volume: number): void;
  getVolume(): number;
  getAudioContextState(): AudioContextState | null;
  dispose(): void;
}
```

**Internal Architecture:**
- **ToneManager:** Handles Tone.js initialization and context management
- **SynthPool:** Manages multiple Tone.Synth instances for polyphonic playback
- **NoteConverter:** Uses Tonal to convert between note names and frequencies

### 2. ModernDigitalStaff (replaces DigitalStaff.tsx)

**Purpose:** React component using VexFlow for professional music notation rendering

**Key Design Decisions:**
- Maintain identical props interface for drop-in replacement
- Use VexFlow's Stave and StaveNote for proper notation
- Implement click detection through SVG event handling
- Preserve existing color-coding and feedback systems

**Interface:**
```typescript
type ModernDigitalStaffProps = {
  selectedNotes: Note[];
  onNoteSelect: (note: Note) => void;
  onNoteDeselect: (note: Note) => void;
  maxNotes: number;
  showCorrectAnswer?: boolean;
  correctNotes?: Note[];
  validationResult?: ValidationResult;
};
```

**Internal Architecture:**
- **VexFlowRenderer:** Manages VexFlow context and rendering
- **InteractionHandler:** Handles click detection and note selection
- **NoteMapper:** Converts between app Note types and VexFlow notation
- **StyleManager:** Applies colors and visual feedback

### 3. MusicTheoryUtils (replaces MusicConstants.ts)

**Purpose:** Utility functions leveraging Tonal for music theory operations

**Key Design Decisions:**
- Use Tonal's Note and Frequency modules
- Maintain existing constant exports for backward compatibility
- Add new utilities that leverage Tonal's capabilities

**Interface:**
```typescript
export const MusicTheoryUtils = {
  // Existing constants (computed from Tonal)
  NOTE_FREQUENCIES: Record<Note, number>
  AVAILABLE_NOTES: Note[]

  // New utilities
  getNoteFrequency(note: Note): number
  getRandomNoteSet(count: number, range?: Note[]): Note[]
  isValidNote(note: string): note is Note
  transposeNote(note: Note, semitones: number): Note
}
```

## Data Models

### Note Type System
```typescript
// Maintain existing Note type for compatibility
export type Note = `${NoteName}${Octave}`;

// Add VexFlow compatibility layer
export type VexFlowNote = {
  keys: string[];
  duration: string;
  clef?: string;
};

// Add Tonal compatibility layer
export type TonalNote = {
  name: string;
  octave: number;
  frequency: number;
};
```

### Staff Position Mapping
```typescript
export type StaffPosition = {
  note: Note;
  vexFlowKey: string; // VexFlow notation key
  linePosition: number; // Legacy compatibility
  requiresLedgerLine: boolean;
  accidental?: 'sharp' | 'flat';
};
```

## Error Handling

### Audio Error Handling
```typescript
export class AudioEngineError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly recoverable: boolean = true
  ) {
    super(message);
  }
}

// Error types:
// - InitializationError: Tone.js setup fails
// - PlaybackError: Note playback fails
// - UnsupportedError: Browser compatibility issues
```

### Notation Error Handling
```typescript
export class NotationError extends Error {
  constructor(
    message: string,
    public readonly note?: Note,
    public readonly recoverable: boolean = true
  ) {
    super(message);
  }
}

// Error types:
// - RenderError: VexFlow rendering fails
// - InvalidNoteError: Note cannot be displayed
// - InteractionError: Click handling fails
```

## Testing Strategy

### Unit Testing Approach
1. **Mock Library Dependencies:** Mock Tone.js, VexFlow, and Tonal in unit tests
2. **Interface Compatibility:** Test that new components maintain exact same interfaces
3. **Error Scenarios:** Test error handling and fallback behaviors
4. **Performance:** Test that new implementations don't degrade performance

### Integration Testing
1. **Audio Playback:** Test actual note playback with real Tone.js
2. **Visual Rendering:** Test VexFlow rendering in browser environment
3. **User Interactions:** Test click handling and note selection
4. **Cross-browser:** Test compatibility across different browsers

### Migration Testing
1. **A/B Testing:** Run old and new implementations side-by-side
2. **Regression Testing:** Ensure all existing functionality works
3. **Performance Comparison:** Compare bundle size and runtime performance

## Implementation Phases

### Phase 1: Foundation Setup
- Install and configure Tone.js, VexFlow, and Tonal
- Create basic wrapper classes with minimal functionality
- Set up TypeScript definitions and build configuration

### Phase 2: Audio Engine Migration
- Implement ModernAudioEngine with full feature parity
- Add comprehensive error handling and fallbacks
- Create unit tests and integration tests

### Phase 3: Digital Staff Migration
- Implement ModernDigitalStaff with VexFlow rendering
- Add interaction handling and visual feedback
- Ensure responsive design and accessibility

### Phase 4: Music Theory Utilities
- Replace MusicConstants with Tonal-based utilities
- Update all references throughout the codebase
- Add new music theory capabilities

### Phase 5: Integration and Optimization
- Replace old components with new implementations
- Optimize bundle size and remove unused code
- Comprehensive testing and performance validation

## Bundle Size Considerations

### Library Sizes (approximate)
- **Tone.js:** ~200KB (can be tree-shaken)
- **VexFlow:** ~150KB (includes fonts)
- **Tonal:** ~50KB (highly modular)

### Optimization Strategies
- Tree-shake unused Tone.js modules
- Use VexFlow's modular build
- Import only needed Tonal packages
- Lazy load notation rendering for better initial load

### Current vs. New Bundle Impact
- **Removed:** Custom audio code (~15KB)
- **Removed:** Custom SVG staff code (~10KB)
- **Added:** Library code (~400KB total)
- **Net Impact:** ~375KB increase, but significantly more reliable and feature-rich

## Migration Strategy

### Backward Compatibility
- Maintain all existing component interfaces
- Use feature flags to switch between implementations
- Provide fallback to old implementation if new one fails

### Rollout Plan
1. **Development:** Implement new components alongside existing ones
2. **Testing:** Thorough testing in development environment
3. **Staging:** Deploy with feature flag to staging environment
4. **Production:** Gradual rollout with monitoring and rollback capability
5. **Cleanup:** Remove old implementations after successful migration

## Performance Considerations

### Audio Performance
- Use Tone.js's built-in optimization for Web Audio API
- Implement proper cleanup to prevent memory leaks
- Use audio context suspension/resumption for better battery life

### Rendering Performance
- Cache VexFlow rendering contexts
- Use requestAnimationFrame for smooth interactions
- Implement virtual scrolling if staff becomes large

### Memory Management
- Properly dispose of Tone.js resources
- Clean up VexFlow SVG elements
- Monitor for memory leaks in long-running sessions
