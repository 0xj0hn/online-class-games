CREATE TABLE IF NOT EXISTS scores (
  game       TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  xp         INTEGER NOT NULL,
  correct    INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (game, name)
);

CREATE INDEX IF NOT EXISTS scores_board ON scores (game, xp DESC, updated_at ASC);