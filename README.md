# BBB Games — Duolingo-style Teacher-Projected Games

Vue 3 + Vite + TypeScript + Tailwind + Pinia + Vitest (TDD)

## Quick Start
```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # vitest run
npm run build
```

## Games (Teacher shares screen in BigBlueButton)
1. **Spin & Speak** (`/game/spin-wheel`) — wheel → prompt → award 10 XP
2. **Quiz Race** (`/game/quiz-race`) — MCQ, timer 15s, 15 XP
3. **Memory Match** (`/game/memory-match`) — word ↔ def, 2×6 cards
4. **Sentence Builder** (`/game/sentence-builder`) — drag words in order
5. **Hangman** (`/game/hangman`) — 6 lives, guess letters
6. **Word Reveal** (`/game/word-reveal`) — blur 24→0px in 4 stages, faster = more XP
7. **Odd One Out** (`/game/odd-one-out`) — 20s
8. **Word Sort** (`/game/word-sort`) — 3 buckets, 60s
9. **Anagram** (`/game/anagram`) — unscramble, 30s
10. **Emoji Story** (`/game/emoji-story`) — emojis → sentence, 45s
11. **Bingo** (`/game/bingo`) — draw · 3×3
12. **Pictionary** (`/game/pictionary`) — draw & guess, 60s
13. **20 Questions** (`/game/twenty-questions`) — 20 questions budget

All games use shared `TeamSelector` (3-6 teams) + `ScoreBoard` + Duolingo style tokens, and each
timed game has a **⏸ Pause / ▶ Start** button so you can freeze the clock while discussing.

## 🎧 Online Practice (solo, for students)
`/practice/quiz-race` and `/practice/anagram` let students drill **on their own device** — no teams,
no projector, unlimited rounds. Each round gives instant feedback, a streak counter, per-question
timer, and a round XP score that can be published to a class leaderboard.

- Student enters a name once (stored in `localStorage` on their device).
- Round length = min(10, questions in the pack) — currently 6 with the seed packs.
- XP = `10–15 XP per correct answer` + a flawless-round bonus. Computed **on the server**.
- The client never sends its own XP. It sends `{ game, name, correct, total }` and the API
  recomputes the score, so a tampered client cannot inflate a leaderboard.

It works with **no backend at all**: if `VITE_API_URL` is unset the game runs fully offline and just
shows an "offline" note instead of the board.

## 🖥️ Self-hosting (your own server)

One Node process serves both the built app and `/api/leaderboard`, with the database
as a single SQLite file. No CDN, no external DB account, and it works on a school LAN
with no outbound internet. Caddy in front issues HTTPS automatically.

### 1. Prepare the host
```bash
# A DNS A record for your hostname (e.g. games.example.com) must point at this server.
git clone <your-repo> bbb-games && cd bbb-games
cp .env.example .env
```

Edit `.env`:
```
DOMAIN=games.example.com      # used by Caddy for the TLS certificate
VITE_API_URL=/                # same origin — one process, no CORS
```
Leave `TURSO_DATABASE_URL` alone: the Compose file sets it to `file:/data/leaderboard.db`.

### 2. Run
```bash
docker compose up -d --build
docker compose logs -f app
```
Then open `https://games.example.com`. Caddy gets a Let's Encrypt certificate on the
first request and renews it automatically. `/api/health` returns `{"ok":true}` once up.

### 3. Update later
```bash
git pull && docker compose up -d --build
```

### Where things live
| What | Where |
| --- | --- |
| Leaderboard database | Docker volume `leaderboard-data` → `/data/leaderboard.db` |
| Back it up | `docker compose exec app tar cf - -C /data . > backup.tar` |
| Restore | `docker compose down -v && docker compose up -d` then extract into `/data` |
| TLS certificates | volume `caddy-data` |
| Logs | `docker compose logs app` |

### Running it without Docker
```bash
npm install
npm run serve            # builds the SPA + bundles the server, then starts it
# or: npm run build && npm run build:server && TURSO_DATABASE_URL=file:./data/leaderboard.db npm start
```
Put nginx/Caddy in front for TLS. The schema is applied automatically on boot, so there
is no migration step.

### Notes
- `libsql` ships prebuilt Linux binaries (x64/arm64, glibc and musl), so no compiler is
  needed on the host. The image is Debian-based (glibc).
- The rate limit is in-memory and per-process, so it resets on restart. Put a real rate
  limit at your reverse proxy for a public deployment.
- `/api/health` is the Compose healthcheck; it reports `503` if the database is unreachable.

## Leaderboard backend as a serverless function (alternative)
Serverless function + managed libSQL database (Turso). This is the alternative to
[Self-hosting](#-self-hosting-your-own-server) above — pick one, not both.

The leaderboard is optional in every setup: if `VITE_API_URL` is empty the practice game
runs fully offline and just shows an "offline" note.

### 1. Create the database (Turso)
```bash
turso db create bbb-games
turso db show bbb-games --url     # → libsql://bbb-games-<org>.turso.io
turso db tokens create bbb-games  # → auth token
cat db/schema.sql | turso db shell bbb-games
```
`db/schema.sql` creates one table plus an index; one best score is kept per `(game, name)`.

### 2. Deploy `api/leaderboard.ts` (Vercel)
Vercel picks up `api/` automatically and serves it at `/api/leaderboard`.
```bash
npm i -g vercel
vercel link                                # attach the repo to a Vercel project
vercel env add TURSO_DATABASE_URL production   # libsql://bbb-games-<org>.turso.io
vercel env add TURSO_AUTH_TOKEN production     # from turso db tokens create
vercel env add ALLOWED_ORIGINS production      # https://your-site.vercel.app  (or *)
vercel --prod
```
> The frontend build needs `VITE_API_URL` **at build time**, and its value is your own
> deployment URL — so deploy first, copy the URL, set `VITE_API_URL=https://your-site.vercel.app`,
> then deploy again. If you skip this the board silently shows "offline" even though the API is live.

**Local testing:** `npx vercel dev` runs both the app and `api/leaderboard.ts` on localhost.

**Netlify instead:** add a thin adapter that calls the default export in `api/leaderboard.ts`.
The logic is transport-agnostic — it only reads `method`, `query`, `headers`, `body` and writes
via `status().json()`. The frontend and API may live on different origins; CORS is handled by
`ALLOWED_ORIGINS` (`*` by default, safe here because the server recomputes every score).

### Endpoints
- `GET  /api/leaderboard?game=quiz-race&limit=10` → `{ entries: [{ name, xp, correct, total }] }`
- `POST /api/leaderboard` `{ game, name, correct, total }` → `{ entry, personalBest }`
- `OPTIONS` → `204` preflight

Server-side guards: name/game sanitising, round bounds (3–25 questions, `correct <= total`),
XP recomputed from `correct` (a tampered `xp` field is ignored), and a per-student cooldown.
The cooldown is in-memory, so it is per-warm-instance only — add a real rate limit at your
CDN/edge for a public deployment.

## Adding a practice game
1. Add an entry to `PRACTICE_CONFIGS` in `src/practice/config.ts` (title, icon, `baseXp`, `seconds`, `questions`).
2. Create `src/practice/<Name>Practice.vue` — props `{ round: number }`, emit `record(ok)`, and
   `defineExpose({ timeUp })` so the shared timer can fail the current question.
3. Register the component in `src/practice/registry.ts`.
4. It appears in `PRACTICE_LIST` and the lobby automatically. No changes to the view.

Keep the XP formula in `config.ts` pure — the API imports the same file so client and server always agree.

## Admin
`/admin` — edit packs (topics/quiz/pairs/sentences/hangman/reveal) stored in localStorage, export/import JSON.

## Design
- Palette `#58CC02` etc., Nunito 800/900, `rounded-2xl border-b-4` pressed effect, max-w-5xl centered for projection.
- TDD: logic files have *.test.ts, `npm run test` must stay green before UI.

## Deploy (classroom use)
For teaching, share the screen in BBB. For student practice, use either
[Self-hosting](#-self-hosting-your-own-server) (recommended — one container, HTTPS out of
the box) or [the serverless function](#leaderboard-backend-as-a-serverless-function-alternative).
Static hosting also works; add `api/leaderboard.ts` if you want a shared leaderboard.