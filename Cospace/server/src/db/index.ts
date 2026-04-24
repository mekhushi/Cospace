import Database from 'better-sqlite3';
import path from 'path';

// Create or connect to SQLite database
const dbPath = path.resolve(__dirname, '../../database.sqlite');
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
