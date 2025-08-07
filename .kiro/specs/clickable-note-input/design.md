# Design Document

## Overview

The Clickable Note Input component will be a React component that renders an interactive musical staff using VexFlow, allowing users to click directly on staff positions to input notes. The component will replace the existing button-based note selection interface with an intuitive click-to-place system similar to professional music notation software like MuseScore.

## Architecture

### Component Structure

```
ClickableNoteInput/
├── ClickableNoteInput.tsx          # Main component
├── hooks/
│   ├── useStaffInteraction.ts      # Mouse/touch interaction logic
│   ├── useNoteManagement.ts        # Note state management
│   └── useKeyboardNavigation.ts    # Keyboard accessibility
├── utils/
│   ├── staffCoordinates.ts         # Staff position calculations
│   ├── notePositioning.ts          # Note placement logic
│   └── touchHandling.ts            # Touch event utilities
└── types/
    └── StaffInteraction.ts         # Type definitions
```

### Core Classes and Interfaces

```typescript
type StaffPosition = {
  x: number;
  y: number;
  pitch: Note;
  linePosition: number;
  isLine: boolean; // true for lines, false for spaces
  requiresLedgerLine: boolean;
};

type InteractionState = {
  hoveredPosition: StaffPosition | null;
  selectedNotes: Set<Note>;
  isDragging: boolean;
  focusedPosition: StaffPosition | null;
};

type ClickableNoteInputProps = {
  selectedNotes: Note[];
  onNoteSelect: (note: Note) => void;
  onNoteDeselect: (note: Note) => void;
  maxNotes: number;
  showCorrectAnswer?: boolean;
  correctNotes?: Note[];
  validationResult?: ValidationResult;
  width?: number;
  height?: number;
  disabled?: boolean;
};
```

## Components and Interfaces

### Main Component: ClickableNoteInput

The main component will manage the VexFlow rendering and coordinate all interactions:

```typescript
const ClickableNoteInput: React.FC<ClickableNoteInputProps> = ({
  selectedNotes,
  onNoteSelect,
  onNoteDeselect,
  maxNotes,
  showCorrectAnswer = false,
  correctNotes = [],
  validationResult,
  width = 600,
  height = 200,
  disabled = false
}) => {
  // Component implementation
};
```

### Hook: useStaffInteraction

Manages mouse and touch interactions with the staff:

```typescript
const useStaffInteraction = (
  containerRef: RefObject<HTMLDivElement>,
  staveRef: RefObject<VexFlow.Stave>,
  onNoteClick: (position: StaffPosition) => void
) => {
  // Returns interaction handlers and state
  return {
    handleMouseMove,
    handleMouseClick,
    handleMouseLeave,
    hoveredPosition,
    isInteracting
  };
};
```

### Hook: useNoteManagement

Handles note state and VexFlow rendering:

```typescript
const useNoteManagement = (
  selectedNotes: Note[],
  onNoteSelect: (note: Note) => void,
  onNoteDeselect: (note: Note) => void,
  maxNotes: number
) => {
  // Returns note management functions
  return {
    addNote,
    removeNote,
    toggleNote,
    canAddNote,
    renderedNotes
  };
};
```

### Utility: staffCoordinates

Converts between screen coordinates and musical positions:

```typescript
class StaffCoordinates {
  constructor(stave: VexFlow.Stave) {
    this.stave = stave;
  }

  screenToStaffPosition(x: number, y: number): StaffPosition {
    // Convert screen coordinates to staff position
  }

  staffPositionToScreen(position: StaffPosition): { x: number; y: number } {
    // Convert staff position to screen coordinates
  }

  getNearestStaffPosition(x: number, y: number): StaffPosition {
    // Snap to nearest line or space
  }
}
```

## Data Models

### StaffPosition Model

Represents a position on the musical staff:

```typescript
type StaffPosition = {
  x: number; // Horizontal position on staff
  y: number; // Vertical position on staff
  pitch: Note; // Musical pitch (e.g., 'C4', 'F#5')
  linePosition: number; // Staff line index (0-10)
  isLine: boolean; // true for lines, false for spaces
  requiresLedgerLine: boolean; // true if position needs ledger lines
  accidental?: 'sharp' | 'flat' | 'natural'; // Accidental if needed
};
```

### InteractionState Model

Tracks the current interaction state:

```typescript
type InteractionState = {
  hoveredPosition: StaffPosition | null;
  selectedNotes: Set<Note>;
  isDragging: boolean;
  dragStartPosition: { x: number; y: number } | null;
  focusedPosition: StaffPosition | null;
  keyboardMode: boolean;
};
```

### NoteRenderData Model

Contains data needed to render a note:

```typescript
type NoteRenderData = {
  vexflowNote: VexFlow.StaveNote;
  position: StaffPosition;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isHovered: boolean;
};
```

## Error Handling

### Input Validation

```typescript
const validateStaffClick = (position: StaffPosition, currentNotes: Note[], maxNotes: number): ValidationResult => {
  if (currentNotes.length >= maxNotes && !currentNotes.includes(position.pitch)) {
    return { valid: false, error: 'Maximum notes reached' };
  }

  if (!isValidPitch(position.pitch)) {
    return { valid: false, error: 'Invalid pitch' };
  }

  return { valid: true };
};
```

### VexFlow Error Handling

```typescript
const safeRenderStaff = (context: VexFlow.RenderContext, stave: VexFlow.Stave) => {
  try {
    stave.setContext(context);
    stave.draw();
  } catch (error) {
    console.error('Failed to render staff:', error);
    // Fallback to simple staff rendering
    renderFallbackStaff(context);
  }
};
```

### Touch Event Error Handling

```typescript
const safeTouchHandler = (event: TouchEvent, handler: (touch: Touch) => void) => {
  try {
    event.preventDefault();
    if (event.touches.length === 1) {
      handler(event.touches[0]);
    }
  } catch (error) {
    console.error('Touch handling error:', error);
  }
};
```

## Testing Strategy

### Unit Tests

1. **Staff Coordinate Conversion Tests**
   - Test screen-to-staff position conversion accuracy
   - Test staff-to-screen position conversion accuracy
   - Test edge cases (above/below staff, ledger lines)

2. **Note Management Tests**
   - Test note addition and removal
   - Test maximum note limit enforcement
   - Test note selection state management

3. **Interaction Logic Tests**
   - Test click detection accuracy
   - Test hover state management
   - Test keyboard navigation

### Integration Tests

1. **VexFlow Integration Tests**
   - Test staff rendering with different configurations
   - Test note rendering and styling
   - Test responsive resizing

2. **Parent Component Integration Tests**
   - Test prop updates and state synchronization
   - Test callback function execution
   - Test validation result display

### Accessibility Tests

1. **Keyboard Navigation Tests**
   - Test tab navigation through staff positions
   - Test arrow key navigation
   - Test Enter/Space key note placement

2. **Screen Reader Tests**
   - Test ARIA label announcements
   - Test focus management
   - Test state change announcements

### Performance Tests

1. **Rendering Performance Tests**
   - Test rendering time with maximum notes
   - Test interaction responsiveness
   - Test memory usage during extended use

2. **Touch Performance Tests**
   - Test touch response time
   - Test gesture recognition accuracy
   - Test multi-touch handling

### Visual Regression Tests

1. **Staff Appearance Tests**
   - Test staff rendering consistency
   - Test note positioning accuracy
   - Test hover and selection visual states

2. **Responsive Design Tests**
   - Test appearance on different screen sizes
   - Test touch target sizes on mobile
   - Test font scaling and readability

## Implementation Approach

### Phase 1: Core Staff Rendering
- Set up VexFlow staff rendering
- Implement basic coordinate system
- Create staff position calculation utilities

### Phase 2: Mouse Interaction
- Add click detection and note placement
- Implement hover effects and visual feedback
- Add note selection and deselection

### Phase 3: Note Management
- Integrate with parent component state
- Add validation and error handling
- Implement maximum note limits

### Phase 4: Enhanced Interactions
- Add keyboard navigation support
- Implement touch/mobile support
- Add accessibility features

### Phase 5: Visual Polish
- Add smooth animations and transitions
- Implement validation result display
- Add responsive design features

### Phase 6: Testing and Optimization
- Comprehensive testing suite
- Performance optimization
- Cross-browser compatibility testing
