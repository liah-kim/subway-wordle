export default function StatsModal({ stats, lastGuessCount, onClose }) {
  if (!stats) return null;

  const winPct = stats.totalPlayed > 0
    ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
    : 0;
  const maxBar = Math.max(...stats.distribution, 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Statistics</h2>
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
        <h3>Guess Distribution</h3>
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
    </div>
  );
}
