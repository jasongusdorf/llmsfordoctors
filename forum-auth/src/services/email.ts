import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

/**
 * Send email verification link to the given address.
 */
export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${config.authUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: config.fromEmail,
    to,
    subject: 'Verify your LLMs for Doctors account',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1e3a5f; font-size: 22px; margin-bottom: 8px;">Welcome to LLMs for Doctors</h1>
        <p style="color: #334155; line-height: 1.6;">
          Thank you for registering. Please verify your email address by clicking the link below.
          This link will expire in 24 hours.
        </p>
        <p style="margin: 24px 0;">
          <a href="${link}"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff;
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">
          Or copy and paste this link: <a href="${link}" style="color: #2563eb;">${link}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset link to the given address. Link expires in 1 hour.
 */
export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${config.authUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: config.fromEmail,
    to,
    subject: 'Reset your LLMs for Doctors password',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1e3a5f; font-size: 22px; margin-bottom: 8px;">Welcome to LLMs for Doctors</h1>
        <p style="color: #334155; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password.
          This link will expire in <strong>1 hour</strong>.
        </p>
        <p style="margin: 24px 0;">
          <a href="${link}"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff;
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">
          Or copy and paste this link: <a href="${link}" style="color: #2563eb;">${link}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          If you did not request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </p>
      </div>
    `,
  });
}
