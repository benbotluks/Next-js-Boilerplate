import type { MusicCallback, NoteHandlers } from '@/MusicTest/types/game';
import type { GameSettings, Note } from '@/types/MusicTypes';
import type { ValidationResult } from '@/utils/AnswerValidation';
import { Answering } from './answering';
import { Listening } from './listening';
import { Setup } from './setup';
import { Validation } from './validation';

export { Answering, Listening, Setup, Validation };

type GamePhaseProps = {
  settings: GameSettings;
  isPlaying: boolean;
  gamePhase: string;
  replayNotes: MusicCallback;
  submitAnswer: MusicCallback;
  resetGame: MusicCallback;
  startNewRound: MusicCallback;
  validationResult: ValidationResult | null;
  selectedNotes: Note[];
  currentNotes: Note[];
  limitNotes: boolean;
  noteHandlers: NoteHandlers;

};

export const GamePhase: React.FC<GamePhaseProps> = (props) => {
  const {
    settings,
    isPlaying,
    gamePhase,
    replayNotes,
    submitAnswer,
    resetGame,
    startNewRound,
    validationResult,
    selectedNotes,
    currentNotes,
    limitNotes,
    noteHandlers,
  } = props;

  return (
    <div className="w-full">
      {gamePhase === 'setup' && <Setup {...{ settings, isPlaying, startNewRound }} />}
      {gamePhase === 'listening' && <Listening />}
      {gamePhase === 'answering' && <Answering {...{ selectedNotes, currentNotes, limitNotes, settings, noteHandlers, isPlaying, replayNotes, submitAnswer }} />}
      {gamePhase === 'feedback' && validationResult && <Validation {...{ validationResult, isPlaying, startNewRound, resetGame, replayNotes, currentNotes, selectedNotes }} />}
    </div>
  );
};
