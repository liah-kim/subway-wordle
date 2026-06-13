import RouteBullet from './RouteBullet';

const MAX_GUESSES = 6;

export default function GuessRow({ guess, index }) {
  if (!guess) {
    return (
      <div className="row empty">
        Guess {index + 1} of {MAX_GUESSES}
      </div>
    );
  }

  return (
    <div className={`row${guess.win ? ' win' : ''}`}>
      <div className="name">
        <span>{guess.station.name}</span>
        <span className="boro">{guess.station.borough}</span>
      </div>
      <div className="chips">
        <div className="chip">
          <div className="shared">
            {guess.shared.length === 0
              ? <span className="no">—</span>
              : guess.shared.map(r => <RouteBullet key={r} route={r} small />)
            }
          </div>
          <div className="k">SHARED</div>
        </div>
        <div className="chip">
          <div className={`v ${guess.boroMatch ? 'ok' : 'no'}`}>
            {guess.boroMatch ? '✓' : '✗'}
          </div>
          <div className="k">BORO</div>
        </div>
        {guess.win ? (
          <div className="chip">
            <div className="v ok">🎉</div>
          </div>
        ) : (
          <>
            <div className="chip">
              <div className="v">{guess.dist.toFixed(1)}</div>
              <div className="k">MILES</div>
            </div>
            <div className="chip arrow">{guess.arrow}</div>
          </>
        )}
      </div>
    </div>
  );
}
