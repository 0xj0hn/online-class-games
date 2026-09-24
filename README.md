# BBB Games — Duolingo-style Teacher-Projected Games

Vue 3 + Vite + TypeScript + Tailwind + Pinia + Vitest (TDD)

## Quick Start
```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # vitest run (23 tests)
npm run build
```

## Games (Teacher shares screen in BigBlueButton)
1. **Spin & Speak** (`/game/spin-wheel`) — wheel → prompt → award 10 XP
2. **Quiz Race** (`/game/quiz-race`) — MCQ, timer 15s, 15 XP
3. **Memory Match** (`/game/memory-match`) — word ↔ def, 2×6 cards
4. **Sentence Builder** (`/game/sentence-builder`) — drag words in order
5. **Hangman** (`/game/hangman`) — 6 lives, guess letters
6. **Word Reveal** (`/game/word-reveal`) — blur 24→0px in 4 stages, faster = more XP

All games use shared `TeamSelector` (3-6 teams) + `ScoreBoard` + Duolingo style tokens.

## Admin
`/admin` — edit packs (topics/quiz/pairs/sentences/hangman/reveal) stored in localStorage, export/import JSON.

## Design
- Palette `#58CC02` etc., Nunito 800/900, `rounded-2xl border-b-4` pressed effect, max-w-5xl centered for projection.
- TDD: logic files have *.test.ts, `npm run test` must stay green before UI.

## Deploy
Static dist/ → Vercel/Netlify. Just share link or screen share in BBB.
