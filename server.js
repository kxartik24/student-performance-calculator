const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || './db.sqlite';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize DB
const db = new sqlite3.Database(DB_FILE);

let initSchema = '';
try {
  initSchema = fs.readFileSync('./schema.sql', 'utf-8');
} catch (e) {
  console.error('schema.sql not found, using default schema.');
  initSchema = `CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    marks_json TEXT NOT NULL,
    num_subjects INTEGER NOT NULL,
    max_marks_per_subject INTEGER NOT NULL,
    total INTEGER NOT NULL,
    percentage REAL NOT NULL,
    grade TEXT NOT NULL,
    remark TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`;
}
db.exec(initSchema, (err) => {
  if (err) console.error('Failed to initialize schema:', err);
});

// Utility: compute result
function computeResult(marks, maxMarksPerSubject = 100) {
  const nums = (marks || []).map(Number).filter(n => !isNaN(n));
  const numSubjects = nums.length;
  if (numSubjects === 0) {
    return { total: 0, percentage: 0, grade: 'N/A', remark: 'No subjects entered', numSubjects: 0 };
  }
  const total = nums.reduce((a, b) => a + b, 0);
  const percentage = (total / (numSubjects * maxMarksPerSubject)) * 100;

  let grade;
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 75) grade = 'A';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 40) grade = 'C';
  else grade = 'F';

  let remark;
  if (grade === 'A+' || grade === 'A') remark = 'Excellent performance!';
  else if (grade === 'B') remark = 'Good, keep improving!';
  else if (grade === 'C') remark = 'Needs more effort.';
  else remark = 'Fail – Work harder.';

  return { total, percentage: Number(percentage.toFixed(2)), grade, remark, numSubjects };
}

// Routes
// Create a result
app.post('/api/results', (req, res) => {
  try {
    const { name, marks, maxMarksPerSubject = 100 } = req.body;
    if (!name || !Array.isArray(marks)) {
      return res.status(400).json({ error: 'name (string) and marks (array) are required' });
    }
    const { total, percentage, grade, remark, numSubjects } = computeResult(marks, maxMarksPerSubject);

    const stmt = db.prepare(`INSERT INTO results 
      (name, marks_json, num_subjects, max_marks_per_subject, total, percentage, grade, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(
      name,
      JSON.stringify(marks.map(Number)),
      numSubjects,
      maxMarksPerSubject,
      total,
      percentage,
      grade,
      remark,
      function(err) {
        if (err) return res.status(500).json({ error: 'DB insert failed' });
        db.get('SELECT * FROM results WHERE id = ?', [this.lastID], (err2, row) => {
          if (err2) return res.status(500).json({ error: 'DB fetch failed' });
          res.status(201).json(row);
        });
      }
    );
  } catch (e) {
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Get all results
app.get('/api/results', (req, res) => {
  db.all('SELECT * FROM results ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB query failed' });
    res.json(rows);
  });
});

// Get single result
app.get('/api/results/:id', (req, res) => {
  db.get('SELECT * FROM results WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB query failed' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Update a result (recompute from marks)
app.put('/api/results/:id', (req, res) => {
  const { name, marks, maxMarksPerSubject = 100 } = req.body;
  if (!name || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'name (string) and marks (array) are required' });
  }
  const { total, percentage, grade, remark, numSubjects } = computeResult(marks, maxMarksPerSubject);

  const stmt = db.prepare(`UPDATE results SET 
    name = ?,
    marks_json = ?,
    num_subjects = ?,
    max_marks_per_subject = ?,
    total = ?,
    percentage = ?,
    grade = ?,
    remark = ?
    WHERE id = ?`);
  stmt.run(
    name,
    JSON.stringify(marks.map(Number)),
    numSubjects,
    maxMarksPerSubject,
    total,
    percentage,
    grade,
    remark,
    req.params.id,
    function(err) {
      if (err) return res.status(500).json({ error: 'DB update failed' });
      db.get('SELECT * FROM results WHERE id = ?', [req.params.id], (err2, row) => {
        if (err2) return res.status(500).json({ error: 'DB fetch failed' });
        res.json(row);
      });
    }
  );
});

// Delete a result
app.delete('/api/results/:id', (req, res) => {
  db.run('DELETE FROM results WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'DB delete failed' });
    res.json({ success: true, deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});