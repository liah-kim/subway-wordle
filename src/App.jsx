import { useState, useEffect } from 'react';
import { pickDaily, pickRandom, computeGuess, sortRoutes, practicePool } from './utils/gameLogic';
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
  const [revealed, setRevealed] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

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

  function startDaily(stationList = stations) {
    if (stationList.length === 0) return;
    const { station: ans, num } = pickDaily(stationList);
    setAnswer(ans);
    setDailyNum(num);
    setMode('daily');
    setRevealed(false);

    const saved = loadGameState(num);
    if (saved?.guessIds?.length > 0) {
      const rehydrated = saved.guessIds
        .map(id => stationList.find(s => s.id === id))
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
  }

  useEffect(() => {
    if (stations.length === 0) return;
    startDaily(stations);
  }, [stations]);

  function startPractice(diff = difficulty) {
    setAnswer(pickRandom(stations, diff));
    setGuesses([]);
    setOver(false);
    setWon(false);
    setMode('practice');
    setLastGuessCount(null);
    setRevealed(false);
  }

  function handleModeChange(newMode) {
    if (newMode === 'daily') startDaily();
    else startPractice();
  }

  function handleDifficultyChange(diff) {
    setDifficulty(diff);
    if (mode === 'practice') startPractice(diff);
  }

  function handleReveal() {
    if (over || revealed) return;
    const capturedGuesses = guesses;
    const capturedMode = mode;
    const capturedDailyNum = dailyNum;
    setRevealed(true);
    setTimeout(() => {
      setOver(true);
      setWon(false);
      setLastGuessCount(capturedGuesses.length);
      if (capturedMode === 'daily') {
        const newStats = updateAndSaveStats(false, capturedGuesses.length, capturedDailyNum);
        setStats(newStats);
        saveGameState(capturedDailyNum, capturedGuesses.map(g => g.station.id), 'lost');
      }
    }, 550);
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
          <button className="icon-btn" onClick={startPractice} aria-label="Random puzzle">🔀</button>
          <h1>Subway Wordle</h1>
          <button className="icon-btn" onClick={() => setInfoTab('howto')} aria-label="Menu">⚙️</button>
        </div>
        <div className="sub">Guess the NYC subway station from its stops</div>
        <div className="modeTag">{mode === 'daily' ? `DAILY #${dailyNum}` : `PRACTICE · ${difficulty}`}</div>
      </header>

      <div className="mystery-flipper">
        <div className={`mystery-card${revealed ? ' flipped' : ''}`}>
          <div className="mystery-front">
            <div className="label">MYSTERY STATION</div>
            <div className="bullets">
              {sortRoutes(answer.routes).map((r, i) => (
                <RouteBullet key={r} route={r} style={{ animationDelay: `${i * 0.07}s` }} />
              ))}
            </div>
            {!over && !revealed && (
              <button className="card-reveal-btn" onClick={handleReveal}>reveal answer</button>
            )}
          </div>
          <div className="mystery-back" onClick={() => setRevealed(false)} title="Flip back">
            <div className="label">ANSWER</div>
            <div className="back-name">{answer.name}</div>
            <div className="back-boro">{answer.borough}</div>
            <div className="back-flip-hint">tap to flip back</div>
          </div>
        </div>
      </div>

      <Board guesses={guesses} />

      <div className="inputWrapOuter">
        <GuessInput
          stations={stations}
          guesses={guesses}
          onGuess={handleGuess}
          disabled={over || revealed}
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
          mode={mode}
          difficulty={difficulty}
          onModeChange={handleModeChange}
          onDifficultyChange={handleDifficultyChange}
          onClose={() => setInfoTab(null)}
        />
      )}

      <div className="legend">Unofficial fan-made · Station data: MTA open data</div>
    </div>
  );
}
