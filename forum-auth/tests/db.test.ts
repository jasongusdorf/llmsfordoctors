import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '../src/db.js';

describe('Database layer', () => {
  let db: ReturnType<typeof createDb>;

  beforeEach(() => {
    db = createDb(':memory:');
  });

  describe('Table creation', () => {
    it('creates users table', () => {
      const tables = db._db
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as { name: string }[];
      const names = tables.map((t) => t.name);
      expect(names).toContain('users');
    });

    it('creates sessions table', () => {
      const tables = db._db
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as { name: string }[];
      const names = tables.map((t) => t.name);
      expect(names).toContain('sessions');
    });

    it('creates email_tokens table', () => {
      const tables = db._db
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as { name: string }[];
      const names = tables.map((t) => t.name);
      expect(names).toContain('email_tokens');
    });
  });

  describe('User CRUD', () => {
    it('creates a user and retrieves by email', () => {
      db.createUser({
        email: 'doc@example.com',
        passwordHash: 'hash123',
        name: 'Dr. Smith',
      });

      const user = db.getUserByEmail('doc@example.com');
      expect(user).not.toBeNull();
      expect(user!.email).toBe('doc@example.com');
      expect(user!.name).toBe('Dr. Smith');
      expect(user!.status).toBe('pending');
      expect(user!.role).toBe('user');
    });

    it('returns null for nonexistent email', () => {
      const user = db.getUserByEmail('nobody@example.com');
      expect(user).toBeNull();
    });

    it('enforces unique email', () => {
      db.createUser({
        email: 'doc@example.com',
        passwordHash: 'hash123',
        name: 'Dr. Smith',
      });

      expect(() => {
        db.createUser({
          email: 'doc@example.com',
          passwordHash: 'hash456',
          name: 'Dr. Jones',
        });
      }).toThrow();
    });

    it('gets user by id', () => {
      const id = db.createUser({
        email: 'doc@example.com',
        passwordHash: 'hash123',
        name: 'Dr. Smith',
      });

      const user = db.getUserById(id);
      expect(user).not.toBeNull();
      expect(user!.id).toBe(id);
    });
  });

  describe('Email verification', () => {
    it('activates user on verifyEmail (pending → active)', () => {
      const id = db.createUser({
        email: 'doc@example.com',
        passwordHash: 'hash123',
        name: 'Dr. Smith',
      });

      const before = db.getUserById(id)!;
      expect(before.status).toBe('pending');
      expect(before.email_verified).toBe(0);

      db.verifyEmail(id);

      const after = db.getUserById(id)!;
      expect(after.status).toBe('active');
      expect(after.email_verified).toBe(1);
    });
  });

  describe('Session CRUD', () => {
    let userId: number;

    beforeEach(() => {
      userId = db.createUser({
        email: 'doc@example.com',
        passwordHash: 'hash123',
        name: 'Dr. Smith',
      });
      db.verifyEmail(userId);
    });

    it('creates and retrieves a session', () => {
      const sessionId = 'test-session-token-abc123';
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      db.createSession({ id: sessionId, userId, expiresAt });

      const session = db.getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.id).toBe(sessionId);
      expect(session!.user_id).toBe(userId);
    });

    it('returns null for expired session', () => {
      const sessionId = 'expired-session-token';
      const expiresAt = new Date(Date.now() - 1000).toISOString();

      db.createSession({ id: sessionId, userId, expiresAt });

      const session = db.getSession(sessionId);
      expect(session).toBeNull();
    });

    it('returns null for session with disabled user', () => {
      const sessionId = 'disabled-user-session';
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      db.createSession({ id: sessionId, userId, expiresAt });
      db.disableUser(userId);

      const session = db.getSession(sessionId);
      expect(session).toBeNull();
    });

    it('deletes a session', () => {
      const sessionId = 'deletable-session';
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      db.createSession({ id: sessionId, userId, expiresAt });
      db.deleteSession(sessionId);

      const session = db.getSession(sessionId);
      expect(session).toBeNull();
    });

    it('deletes all sessions for a user', () => {
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      db.createSession({ id: 'session-a', userId, expiresAt });
      db.createSession({ id: 'session-b', userId, expiresAt });

      db.deleteUserSessions(userId);

      expect(db.getSession('session-a')).toBeNull();
      expect(db.getSession('session-b')).toBeNull();
    });
  });

  describe('Email token CRUD', () => {
    let userId: number;

    beforeEach(() => {
      userId = db.createUser({
        email: 'doc@example.com',
        passwordHash: 'hash123',
        name: 'Dr. Smith',
      });
    });

    it('creates and retrieves an email token', () => {
      const token = 'abc123verifytoken';
      const expiresAt = new Date(Date.now() + 3600000).toISOString();

      db.createEmailToken({ userId, token, type: 'verify', expiresAt });

      const record = db.getEmailToken(token, 'verify');
      expect(record).not.toBeNull();
      expect(record!.token).toBe(token);
      expect(record!.user_id).toBe(userId);
    });

    it('returns null for expired token', () => {
      const token = 'expiredtoken123';
      const expiresAt = new Date(Date.now() - 1000).toISOString();

      db.createEmailToken({ userId, token, type: 'verify', expiresAt });

      const record = db.getEmailToken(token, 'verify');
      expect(record).toBeNull();
    });

    it('returns null for used token', () => {
      const token = 'usedtoken123';
      const expiresAt = new Date(Date.now() + 3600000).toISOString();

      db.createEmailToken({ userId, token, type: 'verify', expiresAt });
      db.useEmailToken(token);

      const record = db.getEmailToken(token, 'verify');
      expect(record).toBeNull();
    });

    it('marks token as used on useEmailToken', () => {
      const token = 'markedtoken123';
      const expiresAt = new Date(Date.now() + 3600000).toISOString();

      db.createEmailToken({ userId, token, type: 'reset', expiresAt });
      db.useEmailToken(token);

      const raw = db._db
        .prepare('SELECT used FROM email_tokens WHERE token = ?')
        .get(token) as { used: number };
      expect(raw.used).toBe(1);
    });
  });
});
