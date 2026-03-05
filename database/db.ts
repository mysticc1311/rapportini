import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('rapportini.db');

export function initDatabase(): void {
  db.execSync(`PRAGMA journal_mode = WAL;`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS customers (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL,
      address   TEXT,
      email     TEXT,
      phone     TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS reports (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      activity    TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      date        TEXT NOT NULL,
      time_start  TEXT NOT NULL,
      time_end    TEXT NOT NULL,
      notes       TEXT,
      createdAt   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
  `);
}

export default db;