const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'contacts.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      position TEXT,
      city TEXT,
      country TEXT DEFAULT 'France',
      whatsapp_number TEXT,
      whatsapp_status TEXT DEFAULT 'unknown',
      telegram_handle TEXT,
      telegram_status TEXT DEFAULT 'unknown',
      source TEXT,
      tags TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      filters TEXT,
      results_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS upload_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      records_total INTEGER DEFAULT 0,
      records_imported INTEGER DEFAULT 0,
      records_skipped INTEGER DEFAULT 0,
      status TEXT DEFAULT 'processing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name);
    CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
    CREATE INDEX IF NOT EXISTS idx_contacts_city ON contacts(city);
    CREATE INDEX IF NOT EXISTS idx_contacts_whatsapp ON contacts(whatsapp_status);
    CREATE INDEX IF NOT EXISTS idx_contacts_telegram ON contacts(telegram_status);
  `);
}

module.exports = { getDb };
