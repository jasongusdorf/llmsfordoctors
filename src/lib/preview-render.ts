import { marked } from 'marked';

// Colors and fonts mirror src/styles/global.css (@theme tokens) and Callout.astro.
export const PREVIEW_CSS = `
body { font-family: 'Quadraat', 'Georgia', serif; font-size: 17px; line-height: 1.7;
  max-width: 46rem; margin: 1.5rem auto; padding: 0 1rem; color: #0f172a; background: #fdfaf4; }
h1, h2, h3 { font-weight: 700; line-height: 1.25; margin: 1.4em 0 .5em; }
h1 { font-size: 1.9em; } h2 { font-size: 1.5em; } h3 { font-size: 1.2em; }
a { color: #2563eb; text-decoration: underline; }
code { background: #f0ead8; padding: .1em .3em; border-radius: 3px; font-size: .9em; }
pre code { display: block; padding: .8em; overflow-x: auto; }
blockquote { border-left: 3px solid #c8b898; margin: 1em 0; padding: .2em 1em; color: #475569; }
hr { border: none; border-top: 1px solid #ddd3be; margin: 2em 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: .92em; }
th, td { border: 1px solid #ddd3be; padding: .4em .6em; text-align: left; }
th { background: #f0ead8; }
img { max-width: 100%; }
.callout { border-left: 4px solid; border-radius: 0 6px 6px 0; padding: 1rem 1.25rem; margin: 1.5rem 0; font-size: .92em; }
.callout-title { font-weight: 600; margin: 0 0 .25rem; }
.callout-hipaa { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
.callout-pitfall { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
.callout-tip { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
.callout-evidence { background: #f0fdf4; border-color: #22c55e; color: #166534; }
.prompt-box { background: #1e293b; color: #f8f4ec; border-radius: 6px; padding: 1rem 1.25rem; margin: 1.5rem 0;
  font-family: ui-monospace, monospace; font-size: .85em; white-space: pre-wrap; }
`;

const CALLOUT_META: Record<string, { icon: string; title: string }> = {
  hipaa: { icon: '🔒', title: 'HIPAA Notice' },
  pitfall: { icon: '⚠️', title: 'Pitfall' },
  tip: { icon: '💡', title: 'Tip' },
  evidence: { icon: '📊', title: 'Evidence' },
};

const CALLOUT_RE = /<Callout\s+type="(\w+)"(?:\s+title="([^"]*)")?\s*>([\s\S]*?)<\/Callout>/g;
const PROMPT_RE = /<PromptPlayground[^>]*>([\s\S]*?)<\/PromptPlayground>/g;

function md(src: string): string {
  return marked.parse(src, { async: false }) as string;
}

// Returns HTML (unsanitized). The caller must sanitize with DOMPurify before display.
export function transformMdxForPreview(source: string): string {
  const withoutImports = source.replace(/^import .*$/gm, '');
  const withComponents = withoutImports
    .replace(CALLOUT_RE, (_, type: string, title: string | undefined, inner: string) => {
      const meta = CALLOUT_META[type] ?? CALLOUT_META.tip;
      return `\n\n<aside class="callout callout-${type}"><p class="callout-title">${meta.icon} ${title || meta.title}</p>${md(inner.trim())}</aside>\n\n`;
    })
    .replace(PROMPT_RE, (_, inner: string) => `\n\n<div class="prompt-box">${escapeHtml(inner.trim())}</div>\n\n`);
  return md(withComponents);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
