import { useState, useEffect } from 'react';
import { pickDaily, pickRandom, computeGuess, sortRoutes } from './utils/gameLogic';
import { loadGameState, saveGameState, loadStats, updateAndSaveStats, loadTheme, saveTheme } from './utils/storage';
import Board from './components/Board';
import GuessInput from './components/GuessInput';
import ResultPanel from './components/ResultPanel';
import InfoModal from './components/InfoModal';
import RouteBullet from './components/RouteBullet';
import './App.css';

const MAX_GUESSES = 6;

export default function App() {
  const [stations, setStations] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [mode, setMode] = useState('daily');
  const [dailyNum, setDailyNum] = useState(1);
  const [infoTab, setInfoTab] = useState(null); // null | 'howto' | 'stats'
  const [stats, setStats] = useState(null);
  const [lastGuessCount, setLastGuessCount] = useState(null);
  const [theme, setTheme] = useState(() => loadTheme());

  useEffect(() => {
    const t = loadTheme();
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }, []);

  function handleThemeChange(t) {
    setTheme(t);
    saveTheme(t);
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  useEffect(() => {
    fetch('/stations.json')
      .then(r => r.json())
      .then(data => setStations(data));
  }, []);

  useEffect(() => {
    if (stations.length === 0) return;
    const { station: ans, num } = pickDaily(stations);
    setAnswer(ans);
    setDailyNum(num);
    setMode('daily');

    const saved = loadGameState(num);
    if (saved?.guessIds?.length > 0) {
      const rehydrated = saved.guessIds
        .map(id => stations.find(s => s.id === id))
        .filter(Boolean)
        .map(s => computeGuess(s, ans));
      setGuesses(rehydrated);
      const isOver = saved.status !== 'playing';
      setOver(isOver);
      setWon(saved.status === 'won');
      if (isOver) setLastGuessCount(rehydrated.length);
    } else {
      setGuesses([]);
      setOver(false);
      setWon(false);
    }
    setStats(loadStats());
  }, [stations]);

  function startPractice() {
    setAnswer(pickRandom(stations));
    setGuesses([]);
    setOver(false);
    setWon(false);
    setMode('practice');
    setLastGuessCount(null);
  }

  function handleGuess(station) {
    if (over || !answer) return;
    if (guesses.some(g => g.station.id === station.id)) return;

    const newGuess = computeGuess(station, answer);
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    const isWin = newGuess.win;
    const isOver = isWin || newGuesses.length >= MAX_GUESSES;

    if (isOver) {
      setOver(true);
      setWon(isWin);
      setLastGuessCount(newGuesses.length);
      if (mode === 'daily') {
        const newStats = updateAndSaveStats(isWin, newGuesses.length, dailyNum);
        setStats(newStats);
      }
    }

    if (mode === 'daily') {
      saveGameState(
        dailyNum,
        newGuesses.map(g => g.station.id),
        isOver ? (isWin ? 'won' : 'lost') : 'playing'
      );
    }
  }

  if (!answer) {
    return (
      <div id="app">
        <div style={{ textAlign: 'center', marginTop: 60, color: '#999' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div id="app">
      <header>
        <div className="header-row">
          <h1>Subway Wordle</h1>
          <button className="icon-btn" onClick={() => setInfoTab('howto')} aria-label="Menu">⚙️</button>
        </div>
        <div className="sub">Guess the NYC subway station from its stops</div>
        <div className="modeTag">{mode === 'daily' ? `DAILY #${dailyNum}` : 'PRACTICE'}</div>
      </header>

      <div className="mystery">
        <div className="label">MYSTERY STATION</div>
        <div className="bullets">
          {sortRoutes(answer.routes).map((r, i) => (
            <RouteBullet key={r} route={r} style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      </div>

      <Board guesses={guesses} />

      <div className="inputWrapOuter">
        <GuessInput
          stations={stations}
          guesses={guesses}
          onGuess={handleGuess}
          disabled={over}
        />
        <div className="hint">
          {over
            ? (won
                ? `Puzzle #${dailyNum} complete!`
                : `The answer was ${answer.name}`)
            : '6 guesses. After each: shared lines, borough, distance & direction.'}
        </div>
      </div>

      {over && (
        <ResultPanel
          won={won}
          guesses={guesses}
          answer={answer}
          dailyNum={dailyNum}
          mode={mode}
          onPractice={startPractice}
        />
      )}

      {infoTab && (
        <InfoModal
          stats={stats}
          lastGuessCount={lastGuessCount}
          initialTab={infoTab}
          theme={theme}
          onThemeChange={handleThemeChange}
          onClose={() => setInfoTab(null)}
        />
      )}

      <div className="legend">Unofficial fan-made · Station data: MTA open data</div>
    </div>
  );
}
