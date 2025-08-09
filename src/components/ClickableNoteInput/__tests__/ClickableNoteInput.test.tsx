import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClickableNoteInput from '../ClickableNoteInput';

describe('ClickableNoteInput', () => {
  const defaultProps = {
    selectedNotes: [],
    onNoteSelect: vi.fn(),
    onNoteDeselect: vi.fn(),
    maxNotes: 3,
  };

  it('renders without crashing', () => {
    render(<ClickableNoteInput {...defaultProps} />);
    
    expect(screen.getByText('Selected: 0 / 3')).toBeInTheDocument();
  });

  it('displays disabled state when disabled prop is true', () => {
    render(<ClickableNoteInput {...defaultProps} disabled />);
    
    expect(screen.getByText('(Disabled)')).toBeInTheDocument();
  });

  it('shows correct selected note count', () => {
    render(<ClickableNoteInput {...defaultProps} selectedNotes={['C4', 'E4']} />);
    
    expect(screen.getByText('Selected: 2 / 3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ClickableNoteInput {...defaultProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('relative', 'custom-class');
  });

  it('applies custom dimensions', () => {
    const { container } = render(<ClickableNoteInput {...defaultProps} width={800} height={300} />);
    
    const component = container.firstChild as HTMLElement;
    expect(component.style.width).toBe('800px');
    expect(component.style.height).toBe('300px');
  });
});