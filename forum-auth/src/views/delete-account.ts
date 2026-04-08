import { layout, escapeHtml } from './layout.js';

export function deleteAccountView(csrfToken: string, error?: string): string {
  const body = `
    <div class="card">
      <h1>Delete Account</h1>
      <p style="font-size:14px;color:#475569;margin-bottom:20px;line-height:1.6;">
        This will permanently delete your account and all associated data.
        Your forum posts will remain but will be attributed to a deleted user.
        This action cannot be undone.
      </p>
      ${error ? `<div class="error-msg">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/delete-account">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />

        <label for="confirmation">Type <strong>DELETE</strong> to confirm</label>
        <input type="text" id="confirmation" name="confirmation" required
               autocomplete="off" placeholder="DELETE" />

        <button type="submit" class="btn" style="background:#b91c1c;margin-top:12px;">
          Delete My Account
        </button>
        <button type="button" class="btn" style="background:#64748b;margin-top:8px;"
                onclick="window.location.href='/login'">
          Cancel
        </button>
      </form>
    </div>
  `;
  return layout('Delete Account', body);
}
