import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import type { DbInterface } from '../db.js';
import { verifyNpi } from '../services/npi.js';
import { generateToken } from '../services/session.js';
import { sendVerificationEmail } from '../services/email.js';
import { registerView } from '../views/register.js';
import { messageView } from '../views/message.js';
import { config } from '../config.js';
import type { MiddlewareHandler } from 'hono';
import type { AppVariables } from '../types.js';

export function registerRoutes(db: DbInterface, rateLimiter: MiddlewareHandler) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.get('/', (c) => {
    const csrfToken = c.get('csrfToken') as string;
    return c.html(registerView(csrfToken, config.hcaptchaSitekey));
  });

  app.post('/', rateLimiter, async (c) => {
    const csrfToken = c.get('csrfToken') as string;
    const body = await c.req.parseBody();

    const firstName = (body['firstName'] as string | undefined)?.trim() ?? '';
    const lastName = (body['lastName'] as string | undefined)?.trim() ?? '';
    const npiNumber = (body['npiNumber'] as string | undefined)?.trim() ?? '';
    const email = (body['email'] as string | undefined)?.trim().toLowerCase() ?? '';
    const password = (body['password'] as string | undefined) ?? '';
    const confirmPassword = (body['confirmPassword'] as string | undefined) ?? '';
    const hcaptchaResponse = (body['h-captcha-response'] as string | undefined) ?? '';

    const renderError = (msg: string) =>
      c.html(registerView(csrfToken, config.hcaptchaSitekey, msg), 400);

    // Validate required fields
    if (!firstName || !lastName || !npiNumber || !email || !password || !confirmPassword) {
      return renderError('All fields are required.');
    }

    if (password.length < 8) {
      return renderError('Password must be at least 8 characters.');
    }

    if (password !== confirmPassword) {
      return renderError('Passwords do not match.');
    }

    if (!/^\d{10}$/.test(npiNumber)) {
      return renderError('NPI number must be exactly 10 digits.');
    }

    // Verify hCaptcha
    const captchaVerify = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: config.hcaptchaSecret,
        response: hcaptchaResponse,
      }).toString(),
    });
    const captchaData = await captchaVerify.json() as { success: boolean };
    if (!captchaData.success) {
      return renderError('Captcha verification failed. Please try again.');
    }

    // Verify NPI
    const npiResult = await verifyNpi(npiNumber, firstName, lastName);
    if (!npiResult.valid) {
      return renderError(`NPI verification failed: ${npiResult.error}`);
    }

    // Check for existing email or NPI
    const existingEmail = db.getUserByEmail(email);
    if (existingEmail) {
      return renderError('An account with this email already exists.');
    }

    const existingNpi = db.getUserByNpi(npiNumber);
    if (existingNpi) {
      return renderError('An account with this NPI number already exists.');
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const name = `${firstName} ${lastName}`;
    const userId = db.createUser({ email, passwordHash, name, npiNumber });

    // Generate verification token (24h expiry)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.createEmailToken({ userId, token, type: 'verify', expiresAt });

    // Send verification email
    await sendVerificationEmail(email, token);

    return c.html(
      messageView(
        'Check Your Email',
        `We've sent a verification link to ${email}. Please check your inbox and click the link to activate your account.`
      )
    );
  });

  return app;
}
