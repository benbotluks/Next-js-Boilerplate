import type { Note } from '@/types/note';

/**
 * Represents a position on the musical staff
 */
export type StaffPosition = {
  /** Horizontal position on staff */
  x: number;
  /** Vertical position on staff */
  y: number;
  /** Musical pitch (e.g., 'C4', 'F#5') */
  pitch: Note;
  /** Staff line index (0-10, where 0 is bottom line) */
  linePosition: number;
  /** true for lines, false for spaces */
  isLine: boolean;
  /** true if position needs ledger lines */
  requiresLedgerLine: boolean;
  /** Accidental if needed */
  accidental?: 'sharp' | 'flat' | 'natural';
};

/**
 * Tracks the current interaction state
 */
export type InteractionState = {
  /** Currently hovered staff position */
  hoveredPosition: StaffPosition | null;
  /** Set of currently selected notes */
  selectedNotes: Set<Note>;
  /** Whether user is currently dragging */
  isDragging: boolean;
  /** Position where drag started */
  dragStartPosition: { x: number; y: number } | null;
  /** Currently focused position for keyboard navigation */
  focusedPosition: StaffPosition | null;
  /** Whether keyboard navigation mode is active */
  keyboardMode: boolean;
};

/**
 * Contains data needed to render a note
 */
export type NoteRenderData = {
  /** VexFlow note object */
  vexflowNote: any; // VexFlow.StaveNote type
  /** Staff position of the note */
  position: StaffPosition;
  /** Whether note is currently selected */
  isSelected: boolean;
  /** Whether note is correct (for validation) */
  isCorrect?: boolean;
  /** Whether note is incorrect (for validation) */
  isIncorrect?: boolean;
  /** Whether note is currently hovered */
  isHovered: boolean;
};

/**
 * Result of input validation
 */
export type ValidationResult = {
  /** Whether the input is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
};

/**
 * Configuration for touch handling
 */
export type TouchConfig = {
  /** Minimum touch target size in pixels */
  minTouchTarget: number;
  /** Touch hold duration for context menu */
  longPressDelay: number;
  /** Whether haptic feedback is enabled */
  hapticFeedback: boolean;
};
