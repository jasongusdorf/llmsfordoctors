import { layout, escapeHtml } from './layout.js';

export function registerView(
  csrfToken: string,
  hcaptchaSitekey: string,
  error?: string
): string {
  const body = `
    <div class="card">
      <h1>Create Account</h1>
      ${error ? `<div class="error-msg">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/register">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />

        <div style="display:flex;gap:12px;">
          <div style="flex:1;">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" required autocomplete="given-name" />
          </div>
          <div style="flex:1;">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" required autocomplete="family-name" />
          </div>
        </div>

        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" required autocomplete="email" />

        <label for="password">Password</label>
        <input type="password" id="password" name="password" required
               minlength="8" autocomplete="new-password" />

        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required
               minlength="8" autocomplete="new-password" />

        <div class="h-captcha" data-sitekey="${escapeHtml(hcaptchaSitekey)}" style="margin-bottom:16px;"></div>
        <script src="https://js.hcaptcha.com/1/api.js" async defer></script>

        <button type="submit" class="btn">Create Account</button>
      </form>
      <div class="links">
        Already have an account? <a href="/login">Log in</a>
      </div>
    </div>
  `;
  return layout('Create Account', body);
}
