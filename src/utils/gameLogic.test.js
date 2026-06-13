import { describe, it, expect } from 'vitest';
import { norm, sortRoutes, computeGuess, buildShareText, dailyPool, pickDaily, ROUTE_ORDER } from './gameLogic';

const TIMES_SQ = { id: '611', name: 'Times Sq-42 St', borough: 'Manhattan', lat: 40.75529, lon: -73.987495, routes: ['1','2','3','7','A','C','E','N','Q','R','W','S'] };
const JAY_ST   = { id: '636', name: 'Jay St-MetroTech', borough: 'Brooklyn', lat: 40.692338, lon: -73.987342, routes: ['A','C','F','R'] };
const ASTORIA  = { id: '1',   name: 'Astoria-Ditmars Blvd', borough: 'Queens', lat: 40.775036, lon: -73.912034, routes: ['N','W'] };

describe('norm', () => {
  it('lowercases and strips punctuation', () => {
    expect(norm('Times Sq-42 St')).toBe('times sq42 st');
    expect(norm('  Jay St-MetroTech  ')).toBe('jay stmetrotech');
  });
});

describe('sortRoutes', () => {
  it('follows ROUTE_ORDER', () => {
    const sorted = sortRoutes(['7','1','N','A','3']);
    expect(sorted).toEqual(['A','N','1','3','7']);
  });
  it('puts unknown routes last', () => {
    const sorted = sortRoutes(['SIR','A']);
    expect(sorted[0]).toBe('A');
    expect(sorted[1]).toBe('SIR');
  });
});

describe('computeGuess', () => {
  it('is a win when IDs match', () => {
    const g = computeGuess(TIMES_SQ, TIMES_SQ);
    expect(g.win).toBe(true);
    expect(g.dist).toBe(0);
  });

  it('computes shared routes correctly', () => {
    const g = computeGuess(JAY_ST, TIMES_SQ);
    // Jay St has A,C,F,R — Times Sq has A,C,E,N,Q,R,W,1,2,3,7,S — shared: A,C,R
    expect(g.shared.sort()).toEqual(['A','C','R'].sort());
    expect(g.boroMatch).toBe(false);
  });

  it('flags borough match', () => {
    const midtown = { ...ASTORIA, id: '999', name: 'Other', borough: 'Manhattan' };
    const g = computeGuess(midtown, TIMES_SQ);
    expect(g.boroMatch).toBe(true);
  });

  it('distance from Times Sq to Jay St is ~4.3 mi', () => {
    const g = computeGuess(TIMES_SQ, JAY_ST);
    expect(g.dist).toBeGreaterThan(3);
    expect(g.dist).toBeLessThan(6);
  });

  it('direction from Astoria to Times Sq is W (mostly west, slightly south)', () => {
    const g = computeGuess(ASTORIA, TIMES_SQ);
    expect(['⬅️','↙️','↖️']).toContain(g.arrow);
  });
});

describe('dailyPool', () => {
  it('excludes stations with fewer than 2 routes', () => {
    const stations = [
      { ...TIMES_SQ },
      { id: '2', name: 'Single', borough: 'Manhattan', lat: 0, lon: 0, routes: ['1'] },
    ];
    expect(dailyPool(stations)).toHaveLength(1);
    expect(dailyPool(stations)[0].id).toBe('611');
  });
});

describe('pickDaily', () => {
  it('returns the same station for the same calendar day', () => {
    const stations = [TIMES_SQ, JAY_ST, ASTORIA];
    const a = pickDaily(stations);
    const b = pickDaily(stations);
    expect(a.station.id).toBe(b.station.id);
    expect(a.num).toBe(b.num);
  });
});

describe('buildShareText', () => {
  it('includes puzzle number and guess count on win', () => {
    const guesses = [computeGuess(TIMES_SQ, TIMES_SQ)];
    const text = buildShareText(guesses, 1, true, 'daily');
    expect(text).toContain('Subway Wordle #1');
    expect(text).toContain('1/6');
    expect(text).toContain('🟩🟩🟩');
  });

  it('uses X on loss', () => {
    const guesses = [computeGuess(JAY_ST, TIMES_SQ)];
    const text = buildShareText(guesses, 5, false, 'daily');
    expect(text).toContain('X/6');
  });
});
