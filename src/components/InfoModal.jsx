import { useState } from 'react';
import RouteBullet from './RouteBullet';

const EXAMPLE_SHARED = ['N', 'Q', 'R', 'W'];

function HowToPlayContent() {
  return (
    <div className="info-content">
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
  );
}

function StatsContent({ stats, lastGuessCount }) {
  if (!stats) return <p className="how-intro">Play a daily puzzle to see your stats.</p>;

  const winPct = stats.totalPlayed > 0
    ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
    : 0;
  const maxBar = Math.max(...stats.distribution, 1);

  return (
    <div className="info-content">
      <div className="stat-row">
        <div className="stat">
          <div className="stat-n">{stats.totalPlayed}</div>
          <div className="stat-l">Played</div>
        </div>
        <div className="stat">
          <div className="stat-n">{winPct}</div>
          <div className="stat-l">Win %</div>
        </div>
        <div className="stat">
          <div className="stat-n">{stats.currentStreak}</div>
          <div className="stat-l">Streak</div>
        </div>
        <div className="stat">
          <div className="stat-n">{stats.maxStreak}</div>
          <div className="stat-l">Max Streak</div>
        </div>
      </div>

      <p className="how-section-label" style={{ marginTop: 20 }}>Guess Distribution</p>

      <div className="distribution">
        {stats.distribution.map((count, i) => (
          <div key={i} className="dist-row">
            <span className="dist-label">{i + 1}</span>
            <div
              className={`dist-bar${lastGuessCount === i + 1 ? ' highlight' : ''}`}
              style={{ width: `${Math.max(8, (count / maxBar) * 100)}%` }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfoModal({ stats, lastGuessCount, initialTab = 'howto', theme, onThemeChange, onClose }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-tabs">
          <button
            className={`tab-btn${tab === 'howto' ? ' active' : ''}`}
            onClick={() => setTab('howto')}
          >
            How to Play
          </button>
          <button
            className={`tab-btn${tab === 'stats' ? ' active' : ''}`}
            onClick={() => setTab('stats')}
          >
            Statistics
          </button>
        </div>

        {tab === 'howto'
          ? <HowToPlayContent />
          : <StatsContent stats={stats} lastGuessCount={lastGuessCount} />
        }

        <div className="theme-row">
          <span className="theme-label">Theme</span>
          <div className="theme-btns">
            {[['system', 'Auto'], ['light', '☀️ Light'], ['dark', '🌙 Dark']].map(([val, label]) => (
              <button
                key={val}
                className={`theme-btn${theme === val ? ' active' : ''}`}
                onClick={() => onThemeChange(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
