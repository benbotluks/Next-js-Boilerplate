import React, { useCallback, useEffect, useRef, useState } from 'react';

export type DualRangeSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  onChange: (minValue: number, maxValue: number) => void;
  className?: string;
  label?: string;
};

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  onChange,
  className = '',
  label,
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate percentages for positioning
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback((clientX: number): number => {
    if (!sliderRef.current) {
      return min;
    }

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const value = min + (percent / 100) * (max - min);

    // Round to nearest step
    return Math.round(value / step) * step;
  }, [min, max, step]);

  const handleMouseDown = useCallback((event: React.MouseEvent, handle: 'min' | 'max') => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(handle);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !sliderRef.current) {
      return;
    }

    const newValue = getValueFromPosition(event.clientX);

    if (isDragging === 'min') {
      const clampedValue = Math.max(min, Math.min(newValue, maxValue));
      if (clampedValue !== minValue) {
        onChange(clampedValue, maxValue);
      }
    } else if (isDragging === 'max') {
      const clampedValue = Math.min(max, Math.max(newValue, minValue));
      if (clampedValue !== maxValue) {
        onChange(minValue, clampedValue);
      }
    }
  }, [isDragging, getValueFromPosition, minValue, maxValue, onChange, min, max]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTrackClick = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      return;
    }

    const newValue = getValueFromPosition(event.clientX);
    const distanceToMin = Math.abs(newValue - minValue);
    const distanceToMax = Math.abs(newValue - maxValue);

    if (distanceToMin <= distanceToMax) {
      const clampedValue = Math.max(min, Math.min(newValue, maxValue));
      onChange(clampedValue, maxValue);
    } else {
      const clampedValue = Math.min(max, Math.max(newValue, minValue));
      onChange(minValue, clampedValue);
    }
  }, [getValueFromPosition, minValue, maxValue, onChange, isDragging, min, max]);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard support
  const handleKeyDown = useCallback((event: React.KeyboardEvent, handle: 'min' | 'max') => {
    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        newValue = handle === 'min'
          ? Math.max(min, minValue - step)
          : Math.max(minValue, maxValue - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        newValue = handle === 'min'
          ? Math.min(maxValue, minValue + step)
          : Math.min(max, maxValue + step);
        break;
      case 'Home':
        event.preventDefault();
        newValue = handle === 'min' ? min : minValue;
        break;
      case 'End':
        event.preventDefault();
        newValue = handle === 'min' ? maxValue : max;
        break;
      default:
        return;
    }

    if (handle === 'min') {
      onChange(newValue, maxValue);
    } else {
      onChange(minValue, newValue);
    }
  }, [min, max, minValue, maxValue, step, onChange]);

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium">
          {`${label}: ${minValue} - ${maxValue}`}
        </label>
      )}

      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-2 w-full cursor-pointer rounded-lg bg-gray-200"
          onClick={handleTrackClick}
          role="presentation"
        >
          {/* Selected range (blue) */}
          <div
            className="pointer-events-none absolute h-full rounded-lg bg-blue-500 transition-all duration-150"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Min handle - Blue */}
          <button
            type="button"
            className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow-md transition-all duration-150 hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${isDragging === 'min' ? 'z-20 scale-110 cursor-grabbing' : 'z-10'
            }`}
            style={{ left: `${minPercent}%` }}
            onMouseDown={e => handleMouseDown(e, 'min')}
            onKeyDown={e => handleKeyDown(e, 'min')}
            aria-label={`Minimum value: ${minValue}`}
            title={`Min: ${minValue}`}
          />

          {/* Max handle - Green */}
          <button
            type="button"
            className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-green-500 shadow-md transition-all duration-150 hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none ${isDragging === 'max' ? 'z-20 scale-110 cursor-grabbing' : 'z-10'
            }`}
            style={{ left: `${maxPercent}%` }}
            onMouseDown={e => handleMouseDown(e, 'max')}
            onKeyDown={e => handleKeyDown(e, 'max')}
            aria-label={`Maximum value: ${maxValue}`}
            title={`Max: ${maxValue}`}
          />
        </div>

        {/* Value labels */}
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};
