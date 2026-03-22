import { layout, escapeHtml } from './layout.js';

export function forgotPasswordView(csrfToken: string, message?: string): string {
  const body = `
    <div class="card">
      <h1>Reset Password</h1>
      ${message ? `<div class="success-msg">${escapeHtml(message)}</div>` : ''}
      <form method="POST" action="/forgot-password">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />

        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" required autocomplete="email" />

        <button type="submit" class="btn">Send Reset Link</button>
      </form>
      <div class="links">
        <a href="/login">Back to login</a>
      </div>
    </div>
  `;
  return layout('Reset Password', body);
}
