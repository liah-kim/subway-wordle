import { useState, useRef, useCallback } from 'react';
import { norm } from '../utils/gameLogic';

export default function GuessInput({ stations, guesses, onGuess, disabled }) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);

  const updateSuggestions = useCallback((query) => {
    if (!query.trim()) { setSuggestions([]); return; }
    const q = norm(query);
    const guessedIds = new Set(guesses.map(g => g.station.id));
    const results = stations
      .filter(s => !guessedIds.has(s.id) && norm(s.name).includes(q))
      .slice(0, 8);
    setSuggestions(results);
    setActiveIdx(-1);
  }, [stations, guesses]);

  function handleInput(e) {
    setValue(e.target.value);
    updateSuggestions(e.target.value);
  }

  function selectStation(station) {
    onGuess(station);
    setValue('');
    setSuggestions([]);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = activeIdx >= 0
        ? suggestions[activeIdx]
        : suggestions.find(s => norm(s.name) === norm(value)) || suggestions[0];
      if (pick) selectStation(pick);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIdx(-1);
    }
  }

  function handleBlur() {
    setTimeout(() => { setSuggestions([]); setActiveIdx(-1); }, 120);
  }

  return (
    <div className="inputWrap">
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              className={`sug${i === activeIdx ? ' active' : ''}`}
              onMouseDown={e => { e.preventDefault(); selectStation(s); }}
            >
              <span>{s.name}</span>
              <span className="sb">{s.borough}</span>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder="Type a station name…"
        autoComplete="off"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
      />
    </div>
  );
}
