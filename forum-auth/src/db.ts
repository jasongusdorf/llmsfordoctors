import Database from 'better-sqlite3';

/** Normalize an ISO 8601 or SQLite datetime string to SQLite's YYYY-MM-DD HH:MM:SS format */
function toSqliteDate(dt: string): string {
  return dt.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace('Z', '');
}

export interface User {
  id: number;
  email: string;
  email_verified: number;
  password_hash: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface EmailToken {
  id: number;
  user_id: number;
  token: string;
  type: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export interface DbInterface {
  _db: Database.Database;
  createUser(params: {
    email: string;
    passwordHash: string;
    name: string;
  }): number;
  getUserByEmail(email: string): User | null;
  getUserById(id: number): User | null;
  verifyEmail(userId: number): void;
  updatePassword(userId: number, passwordHash: string): void;
  disableUser(userId: number): void;
  deleteUser(userId: number): void;
  createSession(params: { id: string; userId: number; expiresAt: string }): void;
  getSession(id: string): Session | null;
  deleteSession(id: string): void;
  deleteUserSessions(userId: number): void;
  createEmailToken(params: {
    userId: number;
    token: string;
    type: string;
    expiresAt: string;
  }): void;
  getEmailToken(token: string, type: string): EmailToken | null;
  useEmailToken(token: string): void;
}

export function createDb(path: string): DbInterface {
  const db = new Database(path);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS email_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration: drop NPI columns from existing databases
  try { db.prepare('ALTER TABLE users DROP COLUMN npi_number').run(); } catch { /* column may not exist */ }
  try { db.prepare('ALTER TABLE users DROP COLUMN npi_verified').run(); } catch { /* column may not exist */ }

  return {
    _db: db,

    createUser({ email, passwordHash, name }) {
      const stmt = db.prepare(
        `INSERT INTO users (email, password_hash, name)
         VALUES (?, ?, ?)`
      );
      const result = stmt.run(email, passwordHash, name);
      return result.lastInsertRowid as number;
    },

    getUserByEmail(email) {
      return (
        (db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined) ?? null
      );
    },

    getUserById(id) {
      return (
        (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined) ?? null
      );
    },

    verifyEmail(userId) {
      db.prepare(
        `UPDATE users SET email_verified = 1, status = 'active' WHERE id = ?`
      ).run(userId);
    },

    updatePassword(userId, passwordHash) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
    },

    disableUser(userId) {
      db.prepare(`UPDATE users SET status = 'disabled' WHERE id = ?`).run(userId);
    },

    deleteUser(userId) {
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    },

    createSession({ id, userId, expiresAt }) {
      db.prepare(
        `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`
      ).run(id, userId, toSqliteDate(expiresAt));
    },

    getSession(id) {
      const row = db.prepare(
        `SELECT s.*, u.email, u.role, u.status as user_status
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ?
           AND s.expires_at > datetime('now')
           AND u.status = 'active'`
      ).get(id) as (Session & { user_status: string }) | undefined;

      if (!row) return null;
      return row;
    },

    deleteSession(id) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    },

    deleteUserSessions(userId) {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    },

    createEmailToken({ userId, token, type, expiresAt }) {
      db.prepare(
        `INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)`
      ).run(userId, token, type, toSqliteDate(expiresAt));
    },

    getEmailToken(token, type) {
      return (
        db.prepare(
          `SELECT * FROM email_tokens
           WHERE token = ?
             AND type = ?
             AND used = 0
             AND expires_at > datetime('now')`
        ).get(token, type) as EmailToken | undefined
      ) ?? null;
    },

    useEmailToken(token) {
      db.prepare('UPDATE email_tokens SET used = 1 WHERE token = ?').run(token);
    },
  };
}
