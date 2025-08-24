import type { StaffPosition } from '../types/StaffInteraction';
import { linePositionToPitch } from './notePositioning';

/**
 * Utility class for converting between screen coordinates and staff positions
 */
export class StaffCoordinates {
  private stave: any; // VexFlow.Stave type
  private lineSpacing: number;
  private staffTop: number;
  private staffBottom: number;

  constructor(stave: any) {
    this.stave = stave;
    this.lineSpacing = stave.getSpacingBetweenLines();
    this.staffTop = stave.getYForLine(0); // Top line of staff
    this.staffBottom = stave.getYForLine(4); // Bottom line of staff
  }

  /**
   * Convert screen coordinates to staff position
   */
  screenToStaffPosition(x: number, y: number): StaffPosition {
    const linePosition = this.getLinePositionFromY(y);
    const pitch = linePositionToPitch(linePosition);
    const isLine = this.isOnStaffLine(linePosition);
    const requiresLedgerLine = this.requiresLedgerLine(linePosition);
    const accidental = pitch.accidental;

    return {
      x,
      y: this.getYForLinePosition(linePosition),
      pitch,
      linePosition,
      isLine,
      requiresLedgerLine,
      accidental,
    };
  }

  /**
   * Convert staff position to screen coordinates
   */
  staffPositionToScreen(position: StaffPosition): { x: number; y: number } {
    return {
      x: position.x,
      y: this.getYForLinePosition(position.linePosition),
    };
  }

  /**
   * Snap coordinates to nearest staff line or space
   */
  getNearestStaffPosition(x: number, y: number): StaffPosition {
    const nearestLinePosition = this.getNearestLinePosition(y);
    const snappedY = this.getYForLinePosition(nearestLinePosition);

    return this.screenToStaffPosition(x, snappedY);
  }

  /**
   * Get line position from Y coordinate
   * Line positions: 0 = bottom line, 1 = first space, 2 = second line, etc.
   * Negative values are below staff, values > 8 are above staff
   */
  private getLinePositionFromY(y: number): number {
    // Calculate relative position from bottom of staff
    const relativeY = this.staffBottom - y;
    const linePosition = Math.round(relativeY / (this.lineSpacing / 2));

    return Math.max(-6, Math.min(14, linePosition)); // Limit to reasonable range
  }

  /**
   * Get Y coordinate for a given line position
   */
  private getYForLinePosition(linePosition: number): number {
    return this.staffBottom - (linePosition * this.lineSpacing / 2);
  }

  /**
   * Get the nearest line position for snapping
   */
  private getNearestLinePosition(y: number): number {
    const exactPosition = (this.staffBottom - y) / (this.lineSpacing / 2);
    return Math.round(exactPosition);
  }

  private isOnStaffLine(linePosition: number): boolean {
    return linePosition % 2 === 0;
  }

  private requiresLedgerLine(linePosition: number): boolean {
    return linePosition < 0 || linePosition > 8;
  }

  isWithinStaffArea(x: number, y: number): boolean {
    const margin = this.lineSpacing * 3; // Allow 3 line spaces above/below
    const leftBound = this.stave.getX();
    const rightBound = this.stave.getX() + this.stave.getWidth();
    const topBound = this.staffTop - margin;
    const bottomBound = this.staffBottom + margin;

    return x >= leftBound && x <= rightBound && y >= topBound && y <= bottomBound;
  }

  getStaffBounds(): { left: number; right: number; top: number; bottom: number } {
    const margin = this.lineSpacing * 3;
    return {
      left: this.stave.getX(),
      right: this.stave.getX() + this.stave.getWidth(),
      top: this.staffTop - margin,
      bottom: this.staffBottom + margin,
    };
  }

  /**
   * Get all valid staff positions within the staff area
   * Useful for keyboard navigation
   */
  getAllValidPositions(): StaffPosition[] {
    const positions: StaffPosition[] = [];
    const staffX = this.stave.getX() + this.stave.getNoteStartX();

    // Only include positions that have actual pitch mappings
    const validLinePositions = [-6, -4, -2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14];

    for (const linePosition of validLinePositions) {
      const y = this.getYForLinePosition(linePosition);
      const position = this.screenToStaffPosition(staffX, y);
      positions.push(position);
    }

    return positions;
  }
}
