import * as SQLite from 'expo-sqlite';

// Initialize SQLite database connection
const db = SQLite.openDatabaseSync('rapportini.db');

/**
 * Initialize the database with all required tables.
 * Handles schema migrations for existing databases that use old schema.
 */
export function initDatabase(): void {
  // Enable Write-Ahead Logging for better concurrent access
  db.execSync(`PRAGMA journal_mode = WAL;`);

  // TABLE: customers
  // Stores customer/company information
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

  // TABLE: reports
  // Check if reports table already exists and its current structure
  const existingReports = db.getAllSync<{name: string}>(`PRAGMA table_info('reports')`);
  const reportColumnNames = existingReports.map((c) => c.name);

  if (existingReports.length === 0) {
    // New database: create fresh reports table
    // Changed from time_start/time_end to hours_worked/hour_cost for better data modeling
    db.execSync(`
      CREATE TABLE reports (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        activity      TEXT NOT NULL,
        customer_id   INTEGER NOT NULL,
        date          TEXT NOT NULL,
        hours_worked  REAL NOT NULL DEFAULT 0,
        hour_cost     REAL NOT NULL DEFAULT 0,
        notes         TEXT,
        createdAt     TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );
    `);
  } else if (reportColumnNames.includes('time_start') || reportColumnNames.includes('time_end')) {
    // Migrate old schema: rename old table and create new one
    db.execSync(`ALTER TABLE reports RENAME TO reports_old;`);

    db.execSync(`
      CREATE TABLE reports (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        activity      TEXT NOT NULL,
        customer_id   INTEGER NOT NULL,
        date          TEXT NOT NULL,
        hours_worked  REAL NOT NULL DEFAULT 0,
        hour_cost     REAL NOT NULL DEFAULT 0,
        notes         TEXT,
        createdAt     TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );
    `);

    // Copy existing data (time fields are dropped in migration)
    db.execSync(`
      INSERT INTO reports (id, activity, customer_id, date, notes, createdAt)
      SELECT id, activity, customer_id, date, notes, createdAt FROM reports_old;
    `);

    db.execSync(`DROP TABLE reports_old;`);
  } else {
    // Update existing table: add missing columns
    if (!reportColumnNames.includes('hours_worked')) {
      db.execSync(`ALTER TABLE reports ADD COLUMN hours_worked REAL NOT NULL DEFAULT 0;`);
    }
    if (!reportColumnNames.includes('hour_cost')) {
      db.execSync(`ALTER TABLE reports ADD COLUMN hour_cost REAL NOT NULL DEFAULT 0;`);
    }
  }

  // TABLE: items
  // Stores inventory items/products/services that can be used in reports
  db.execSync(`
    CREATE TABLE IF NOT EXISTS items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      cost        REAL NOT NULL,
      createdAt   TEXT DEFAULT (datetime('now'))
    );
  `);

  // TABLE: report_items
  // Bridge table for N:N relationship between reports and items
  // Allows multiple items per report and tracks quantity of each
  db.execSync(`
    CREATE TABLE IF NOT EXISTS report_items (
      report_id INTEGER NOT NULL,
      item_id   INTEGER NOT NULL,
      quantity  REAL NOT NULL DEFAULT 1,
      PRIMARY KEY (report_id, item_id),
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id)   REFERENCES items(id) ON DELETE CASCADE
    );
  `);
}

export default db;