CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  marks_json TEXT NOT NULL, -- JSON array of numbers
  num_subjects INTEGER NOT NULL,
  max_marks_per_subject INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage REAL NOT NULL,
  grade TEXT NOT NULL,
  remark TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);