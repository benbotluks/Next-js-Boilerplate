import type { ReactNode } from 'react';
import type { MusicCallback } from '@/MusicTest/types/game';

type ButtonProps = {
  onClick: MusicCallback;
  children: ReactNode;
  module?: 'noteInput' | 'game' | 'settings';
  disabled?: boolean;
  classNames?: string[];
};

const baseStyle = {
  game: [
    'rounded-lg',
    'bg-gray-600',
    'px-4',
    'py-2',
    'text-white',
    'hover:bg-gray-700',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ],
  noteInput: [
    'w-full',
    'px-3',
    'py-2',
    'text-left',
    'text-sm',
    'hover:bg-gray-100',
    'focus:bg-gray-100',
    'focus:outline-none',
  ],
  settings: [
    'rounded-md',
    'bg-gray-500',
    'px-4',
    'py-2',
    'text-white',
    'transition-colors',
    'hover:bg-gray-600',
    'focus:ring-2',
    'focus:ring-gray-500',
    'focus:ring-offset-2',
    'focus:outline-none',
  ],
};

const cx = (classes: string[]) => {
  return classes.join(' ');
};

export const Button: React.FC<ButtonProps> = (props) => {
  const { onClick, disabled, children, classNames, module } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || false}
      className={cx([...baseStyle[module || 'game'], ...(classNames || [])])}
    >
      {children}
    </button>
  );
};
