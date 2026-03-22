import { layout, escapeHtml } from './layout.js';

export function messageView(title: string, message: string): string {
  const body = `
    <div class="card">
      <h1>${escapeHtml(title)}</h1>
      <p style="color:#334155;line-height:1.6;">${escapeHtml(message)}</p>
    </div>
  `;
  return layout(title, body);
}
