import { layout, escapeHtml } from './layout.js';

export function resetPasswordView(
  csrfToken: string,
  token: string,
  error?: string
): string {
  const body = `
    <div class="card">
      <h1>Choose New Password</h1>
      ${error ? `<div class="error-msg">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/reset-password">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />
        <input type="hidden" name="token" value="${escapeHtml(token)}" />

        <label for="password">New Password</label>
        <input type="password" id="password" name="password" required
               minlength="8" autocomplete="new-password" />

        <label for="confirmPassword">Confirm New Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required
               minlength="8" autocomplete="new-password" />

        <button type="submit" class="btn">Reset Password</button>
      </form>
    </div>
  `;
  return layout('Reset Password', body);
}
