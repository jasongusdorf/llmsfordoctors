import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { AppVariables } from './types.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { createDb } from './db.js';
import { config } from './config.js';

// Ensure the database directory exists before opening SQLite
const dbDir = dirname(config.databasePath);
if (dbDir && !existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}
import { csrfToken, csrfValidate } from './middleware/csrf.js';
import { rateLimit } from './middleware/rate-limit.js';
import { registerRoutes } from './routes/register.js';
import { loginRoutes } from './routes/login.js';
import { ssoRoutes } from './routes/sso.js';
import { forgotPasswordRoutes } from './routes/forgot-password.js';
import { resetPasswordRoutes } from './routes/reset-password.js';
import { verifyEmailRoutes } from './routes/verify-email.js';
import { logoutRoutes } from './routes/logout.js';
import { deleteAccountRoutes } from './routes/delete-account.js';

const db = createDb(config.databasePath);

const app = new Hono<{ Variables: AppVariables }>();

// Global middleware
app.use('*', logger());
app.use('*', csrfToken);
app.use('*', csrfValidate);

// Rate limiters
const authRateLimiter = rateLimit(5);

// Mount routes
app.route('/register', registerRoutes(db, authRateLimiter));
app.route('/login', loginRoutes(db, authRateLimiter));
app.route('/sso', ssoRoutes(db));
app.route('/forgot-password', forgotPasswordRoutes(db, authRateLimiter));
app.route('/reset-password', resetPasswordRoutes(db));
app.route('/verify-email', verifyEmailRoutes(db));
app.route('/logout', logoutRoutes(db));
app.route('/delete-account', deleteAccountRoutes(db));

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Start server
serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`Forum auth service running on port ${config.port}`);
});
