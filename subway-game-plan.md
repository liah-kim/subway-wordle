# NYC Subway Station Guessing Game — Execution Plan

A daily-puzzle game (Wordle-style): the player sees the colored route bullets of the trains serving a mystery station and guesses which station it is in limited attempts. This plan covers two implementation paths — **iOS (SwiftUI)** and **web** — with shared game design and data sections.

Prior art worth studying: **Subwaydle** (subwaydle.com) — a web game where you guess a subway *trip*. Your concept (guess the *station* from its line colors) is different enough to stand on its own, but Subwaydle is a great reference for feedback mechanics and share-card design.

---

## 1. Game design

**Core loop**

1. Show the route bullets for today's station (e.g., 🔴 1·2·3 + 🟡 N·Q·R·W + 🟣 7).
2. Player types a guess; an autocomplete list restricts input to real stations.
3. After each wrong guess, give feedback:
   - **Borough** — match or not
   - **Distance** — miles from guess to answer
   - **Direction** — compass arrow from guess toward answer (like Worldle)
   - **Lines** — which lines the guessed station shares with the answer
4. 6 guesses. Win/lose screen with shareable emoji grid (🟩🟨⬜ + colored circles for the lines).

**The ambiguity problem.** Many stations have identical line sets (every local-only 1 station looks the same). Solutions, pick one or combine:
- Only use stations with reasonably distinctive line sets for the daily puzzle (curate ~150–250 candidates).
- Reveal a progressive hint each wrong guess: borough → neighborhood → cross street.
- The distance/direction feedback itself disambiguates after 1–2 guesses, so perfect uniqueness isn't required.

**Daily puzzle selection.** No backend needed: seed a deterministic RNG with the date (days since epoch) and index into a shuffled station list. Everyone gets the same puzzle on the same day.

**Persistence.** UserDefaults (or SwiftData later) for: streak, win distribution, today's in-progress guesses, has-played-today flag.

## 2. Data

Source: **MTA static GTFS / open data** (no API key needed for static files).
- `Stations.csv` from the MTA's official station list (data.ny.gov, "MTA Subway Stations") — gives station name, borough, GTFS lat/lon, and **Daytime Routes** per station. This one file is nearly everything you need.
- Official line colors (MTA branding):
  - 1/2/3 `#EE352E` · 4/5/6 `#00933C` · 7 `#B933AD`
  - A/C/E `#0039A6` · B/D/F/M `#FF6319` · G `#6CBE45`
  - J/Z `#996633` · L `#A7A9AC` · N/Q/R/W `#FCCC0A` · S `#808183`

Pipeline (one-time Python or Swift script):
1. Download Stations.csv.
2. Merge station *complexes* (Times Sq–42 St is several rows; group by Complex ID so the puzzle uses the full line set).
3. Emit `stations.json`: `{ id, name, borough, lat, lon, routes: ["N","Q","R","W","7", ...] }`.
4. Bundle the JSON in the app — fully offline, ~470 stations / ~25 KB.

Note: bullets/colors are MTA trademarks. Fine for personal use; if you ship to the App Store, the MTA has a licensing program for its marks — worth a quick check at that point (Subwaydle and many quiz apps exist, so it's well-trodden ground).

## 3. Choosing a platform

| | iOS (SwiftUI) | Web |
|---|---|---|
| Effort to playable game | Higher (new language + framework) | Lower (HTML/CSS/JS, instant feedback loop) |
| Distribution | Requires Xcode build; App Store costs $99/yr + review | Free (GitHub Pages/Vercel), share a URL, works on every phone |
| Daily-puzzle fit | Fine | Ideal — Wordle's virality came from zero-install links |
| What you learn | Swift/SwiftUI, native dev | Standard web skills |
| Native feel | Haptics, widgets, offline by default | Slightly less polished; PWA closes most of the gap |

**Recommendation:** build the **web version first**. Same game logic and data, much faster iteration, and friends can play it the moment you share a link. If you still want the iOS version, port it afterward — or wrap the site in a minimal SwiftUI `WKWebView` shell as a stepping stone. Either way, milestones M1–M3 below are platform-agnostic logic; only the UI layer differs.

## 4A. Implementation plan — Web

**Stack:** Vite + vanilla JS or React (React recommended — Claude Code is very fluent in it), CSS only, no backend. `stations.json` fetched statically. State in `localStorage`. Deploy to GitHub Pages or Vercel (both free, one command).

**Milestones**

- **W0 — Setup:** `npm create vite@latest subway-game -- --template react`, run dev server, deploy the empty shell to Vercel so the pipeline works from day one. Run `claude` + `/init` in the repo.
- **W1 — Data:** same as section 2; drop `stations.json` in `public/`.
- **W2 — Playable core:** `RouteBullet` component (colored circle + letter), autocomplete `<input>` over station names, feedback rows (borough/distance/direction/shared lines), 6-guess win/lose state. Hardcoded answer.
- **W3 — Daily logic + stats:** date-seeded answer, `localStorage` for guesses/streak/distribution, "come back tomorrow" state. Tests for feedback + seeding logic (Vitest).
- **W4 — Polish:** share button (emoji grid via `navigator.share`/clipboard), animations, dark mode, how-to-play modal, mobile layout, PWA manifest for "add to home screen."

## 4B. Implementation plan — iOS (SwiftUI)

**Stack:** SwiftUI + Swift, iOS 17+, single target, no backend or dependencies. One `GameViewModel` (ObservableObject), models for `Station`/`Guess`/`GameState`, bundled JSON loaded at launch. Xcode is free; run on simulator or your own device with a free Apple ID.

**Milestones**

- **M0 — Setup:** install Xcode, create the SwiftUI project, run "Hello World" on the simulator. Run `claude` + `/init` in the project folder.
- **M1 — Data:** bundle `stations.json`; unit test that loads it and spot-checks stations (Times Sq has N/Q/R/W/S/1/2/3/7).
- **M2 — Playable core:** route-bullet view, searchable autocomplete guess input, feedback rows, win/lose state. Hardcoded answer; ignore polish.
- **M3 — Daily logic + stats:** date-seeded selection, UserDefaults persistence, streak/distribution, "come back tomorrow."
- **M4 — Polish:** `ShareLink` emoji grid, animations/haptics, app icon, dark mode, how-to-play sheet.
- **M5 — Ship (optional):** Apple Developer Program ($99/yr) → TestFlight → App Store review. Needs icon set, screenshots, privacy label (easy — you collect nothing), and the MTA trademark check above.

## 5. Working with Claude Code

- Start each milestone by describing the goal and letting Claude plan before writing code (plan mode: shift+tab).
- Keep CLAUDE.md updated with the architecture decisions above so every session has context.
- Ask Claude to write unit tests for game logic (feedback calculation, daily seeding) — that's where bugs hide; UI you can verify by eye.
- Web caveat: none, really — Claude Code can run the dev server, tests, and deploys end-to-end.
- iOS caveat: Claude Code can build via `xcodebuild`, but you'll do simulator runs and visual checks in Xcode yourself.

**Suggested first prompt for W2/M2:** "Create a component/view that renders a row of subway route bullets: colored circles with the route letter/number centered, using the MTA color mapping in stations.json."
