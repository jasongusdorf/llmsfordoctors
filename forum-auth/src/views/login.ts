import { layout, escapeHtml } from './layout.js';

export function loginView(
  csrfToken: string,
  error?: string,
  returnTo?: string
): string {
  const body = `
    <div class="card">
      <h1>Log In</h1>
      ${error ? `<div class="error-msg">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/login">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />
        ${returnTo ? `<input type="hidden" name="return" value="${escapeHtml(returnTo)}" />` : ''}

        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" required autocomplete="email" />

        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" />

        <button type="submit" class="btn">Log In</button>
      </form>
      <div class="links-row">
        <a href="/forgot-password">Forgot password?</a>
        <a href="/register">Create account</a>
      </div>
    </div>
  `;
  return layout('Log In', body);
}
