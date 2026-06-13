import { useState } from 'react';
import { buildShareText } from '../utils/gameLogic';

export default function ResultPanel({ won, guesses, answer, dailyNum, mode, onPractice }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = buildShareText(guesses, dailyNum, won, mode);
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, () => prompt('Copy your result:', text));
    } else {
      prompt('Copy your result:', text);
    }
  }

  return (
    <div className="result">
      <h2>
        {won
          ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!`
          : 'Next time!'}
      </h2>
      <div className="answer">{answer.name} ({answer.borough})</div>
      <button className="btn" onClick={handleShare}>
        {copied ? 'Copied!' : 'Share result'}
      </button>
      <button className="btn alt" onClick={onPractice}>Play a random station</button>
    </div>
  );
}
