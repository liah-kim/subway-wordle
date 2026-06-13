import GuessRow from './GuessRow';

const MAX_GUESSES = 6;

export default function Board({ guesses }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_GUESSES }, (_, i) => (
        <GuessRow key={i} guess={guesses[i] ?? null} index={i} />
      ))}
    </div>
  );
}
