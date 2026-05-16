CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model TEXT NOT NULL,
  original TEXT NOT NULL,
  suggestions TEXT NOT NULL,
  rewritten TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('default_model', 'deepseek');
INSERT OR IGNORE INTO settings (key, value) VALUES ('api_key_deepseek', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('api_key_mimo', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('api_key_zhipu', '');
