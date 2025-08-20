import type { MusicCallback } from '../types/game';

type GameErrorProps = {
  errorType: string;
  message: string;
  dismiss: MusicCallback;
};

export const GameError: React.FC<GameErrorProps> = ({ errorType, message, dismiss }) => {
  switch (errorType) {
    case 'audio': {
      return (
        <div className="mb-4 w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Audio Error:
              {' '}
              {message}
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      );
    }
  }
};
