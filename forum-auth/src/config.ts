import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export const config = {
  port: parseInt(optional('PORT', '3000'), 10),
  databasePath: optional('DATABASE_PATH', './data/forum-auth.db'),
  ssoSecret: required('SSO_SECRET'),
  discourseUrl: required('DISCOURSE_URL'),
  authUrl: required('AUTH_URL'),
  mainSiteUrl: required('MAIN_SITE_URL'),
  hcaptchaSecret: required('HCAPTCHA_SECRET'),
  hcaptchaSitekey: required('HCAPTCHA_SITEKEY'),
  smtp: {
    host: required('SMTP_HOST'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: required('SMTP_USER'),
    pass: required('SMTP_PASS'),
  },
  fromEmail: required('FROM_EMAIL'),
  sessionMaxAgeDays: parseInt(optional('SESSION_MAX_AGE_DAYS', '30'), 10),
};
