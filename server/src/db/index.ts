import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create or connect to SQLite database
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../database.sqlite');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT NOT NULL
  )
`);

export default db;
