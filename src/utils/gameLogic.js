export const ROUTE_ORDER = ['A','C','E','B','D','F','M','G','L','J','Z','N','Q','R','W','1','2','3','4','5','6','7','S'];

export const COLORS = {
  A:'#0039A6', C:'#0039A6', E:'#0039A6',
  B:'#FF6319', D:'#FF6319', F:'#FF6319', M:'#FF6319',
  G:'#6CBE45', J:'#996633', Z:'#996633', L:'#A7A9AC',
  N:'#FCCC0A', Q:'#FCCC0A', R:'#FCCC0A', W:'#FCCC0A',
  S:'#808183', '1':'#EE352E','2':'#EE352E','3':'#EE352E',
  '4':'#00933C','5':'#00933C','6':'#00933C','7':'#B933AD',
};

export const DARK_TEXT = new Set(['N','Q','R','W','L']);

export function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

export function sortRoutes(routes) {
  return [...routes].sort((a, b) => {
    const ai = ROUTE_ORDER.indexOf(a);
    const bi = ROUTE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function haversineMi(a, b) {
  const R = 3958.8, toR = x => x * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingArrow(from, to) {
  const toR = x => x * Math.PI / 180;
  const dLon = toR(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(toR(to.lat));
  const x = Math.cos(toR(from.lat)) * Math.sin(toR(to.lat))
    - Math.sin(toR(from.lat)) * Math.cos(toR(to.lat)) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return ['⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️'][Math.round(brng / 45) % 8];
}

export function dailyPool(stations) {
  return stations.filter(s => s.routes.length >= 2);
}

export function pickDaily(stations) {
  const now = new Date();
  const epochDay = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const num = epochDay - Math.floor(Date.UTC(2026, 5, 12) / 86400000) + 1;
  const pool = dailyPool(stations);
  const rng = mulberry32(epochDay * 2654435761);
  return { station: pool[Math.floor(rng() * pool.length)], num };
}

export function practicePool(stations, difficulty) {
  if (difficulty === 'easy') return stations.filter(s => s.routes.length >= 4);
  if (difficulty === 'hard') return stations; // all stations, including single-route
  return dailyPool(stations); // medium: 2+ routes
}

export function pickRandom(stations, difficulty = 'medium') {
  const pool = practicePool(stations, difficulty);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function computeGuess(guessed, answer) {
  return {
    station: guessed,
    win: guessed.id === answer.id,
    shared: sortRoutes(guessed.routes.filter(r => answer.routes.includes(r))),
    boroMatch: guessed.borough === answer.borough,
    dist: haversineMi(guessed, answer),
    arrow: bearingArrow(guessed, answer),
  };
}

export function buildShareText(guesses, dailyNum, won, mode) {
  const head = mode === 'daily' ? `Subway Wordle #${dailyNum}` : 'Subway Wordle (practice)';
  const lines = guesses.map(g => {
    if (g.win) return '🟩🟩🟩';
    const d = g.dist;
    return (d < 1 ? '🟨' : d < 5 ? '🟧' : '⬛') + (g.boroMatch ? '🟩' : '⬛') + g.arrow;
  });
  return `${head} ${won ? guesses.length : 'X'}/6\n${lines.join('\n')}`;
}
