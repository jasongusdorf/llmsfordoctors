import { layout, escapeHtml } from './layout.js';

export function verifyEmailView(success: boolean, message: string): string {
  const body = `
    <div class="card">
      <h1>Email Verification</h1>
      <div class="${success ? 'success-msg' : 'error-msg'}">
        ${escapeHtml(message)}
      </div>
      ${success ? `<div class="links"><a href="/login">Continue to login</a></div>` : ''}
    </div>
  `;
  return layout('Email Verification', body);
}
