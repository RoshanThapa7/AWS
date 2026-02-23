import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tracker.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('day', 'week')),
  targetCount INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  scheduledDate TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskId INTEGER,
  titleSnapshot TEXT,
  date TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(taskId) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS calorie_entries (
  date TEXT PRIMARY KEY,
  calories INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS weight_entries (
  date TEXT PRIMARY KEY,
  weight REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS diary_entries (
  date TEXT PRIMARY KEY,
  content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings(key, value) VALUES ('targetCalories', '1800');
`);

const columns = db.prepare('PRAGMA table_info(tasks)').all() as { name: string }[];
const names = new Set(columns.map((col) => col.name));
if (!names.has('sortOrder')) db.exec('ALTER TABLE tasks ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0');
if (!names.has('scheduledDate')) db.exec('ALTER TABLE tasks ADD COLUMN scheduledDate TEXT');

db.exec(`
UPDATE tasks
SET sortOrder = id
WHERE sortOrder = 0;
`);

export type Task = {
  id: number;
  title: string;
  period: 'day' | 'week';
  targetCount: number;
  active: 1 | 0;
  sortOrder: number;
  scheduledDate: string | null;
};

export function hasUser() {
  const row = db.prepare('SELECT id FROM users WHERE id = 1').get();
  return Boolean(row);
}
