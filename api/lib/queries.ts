export const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS scores (
  game       TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  xp         INTEGER NOT NULL,
  correct    INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (game, name)
)`

export const CREATE_INDEX = `
CREATE INDEX IF NOT EXISTS scores_board ON scores (game, xp DESC, updated_at ASC)`

export const UPSERT_BEST = `
INSERT INTO scores (game, name, xp, correct, total, updated_at)
VALUES (?, ?, ?, ?, ?, datetime('now'))
ON CONFLICT(game, name) DO UPDATE SET
  xp          = CASE WHEN excluded.xp > scores.xp THEN excluded.xp ELSE scores.xp END,
  correct     = CASE WHEN excluded.xp > scores.xp THEN excluded.correct ELSE scores.correct END,
  total       = CASE WHEN excluded.xp > scores.xp THEN excluded.total ELSE scores.total END,
  updated_at  = CASE WHEN excluded.xp > scores.xp THEN excluded.updated_at ELSE scores.updated_at END
RETURNING xp, correct, total`

export const SELECT_ONE = `SELECT xp, correct, total FROM scores WHERE game = ? AND name = ?`

export const SELECT_BOARD = `
SELECT name, xp, correct, total FROM scores
WHERE game = ?
ORDER BY xp DESC, updated_at ASC
LIMIT ?`