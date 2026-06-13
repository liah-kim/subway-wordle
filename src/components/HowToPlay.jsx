import RouteBullet from './RouteBullet';

const EXAMPLE_SHARED = ['N', 'Q', 'R', 'W'];

export default function HowToPlay({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>How to Play</h2>

        <p className="how-intro">
          Guess which NYC subway station serves the shown route bullets. You have <strong>6 tries</strong>.
        </p>

        <div className="how-divider" />

        <p className="how-section-label">After each guess you'll see:</p>

        <div className="how-items">
          <div className="how-item">
            <div className="how-icon">
              {EXAMPLE_SHARED.map(r => <RouteBullet key={r} route={r} small />)}
            </div>
            <div className="how-text">
              <strong>Shared lines</strong> — routes the guessed station has in common with the answer
            </div>
          </div>

          <div className="how-item">
            <div className="how-icon how-chip-pair">
              <span className="how-ok">✓</span>
              <span className="how-no">✗</span>
            </div>
            <div className="how-text">
              <strong>Borough</strong> — whether your guess is in the same borough as the answer
            </div>
          </div>

          <div className="how-item">
            <div className="how-icon how-num">0.4</div>
            <div className="how-text">
              <strong>Miles</strong> — straight-line distance from your guess to the answer
            </div>
          </div>

          <div className="how-item">
            <div className="how-icon how-arrow">↗️</div>
            <div className="how-text">
              <strong>Direction</strong> — compass arrow pointing from your guess toward the answer
            </div>
          </div>
        </div>

        <div className="how-divider" />

        <p className="how-footer">A new station every day. Come back tomorrow!</p>
      </div>
    </div>
  );
}
