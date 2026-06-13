const GAME_KEY = 'nextstop-game';
const STATS_KEY = 'nextstop-stats';
const THEME_KEY = 'nextstop-theme';

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'system';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function defaultStats() {
  return {
    totalPlayed: 0,
    totalWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastWonPuzzle: null,
  };
}

export function loadGameState(puzzleNum) {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.puzzleNum === puzzleNum ? data : null;
  } catch {
    return null;
  }
}

export function saveGameState(puzzleNum, guessIds, status) {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify({ puzzleNum, guessIds, status }));
  } catch {}
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...defaultStats(), ...JSON.parse(raw) } : defaultStats();
  } catch {
    return defaultStats();
  }
}

export function updateAndSaveStats(won, guessCount, puzzleNum) {
  const stats = loadStats();
  stats.totalPlayed += 1;
  if (won) {
    stats.totalWon += 1;
    stats.currentStreak = stats.lastWonPuzzle === puzzleNum - 1 ? stats.currentStreak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.lastWonPuzzle = puzzleNum;
    stats.distribution[guessCount - 1] += 1;
  } else {
    stats.currentStreak = 0;
  }
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
  return stats;
}
