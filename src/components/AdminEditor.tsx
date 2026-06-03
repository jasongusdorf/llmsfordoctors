import { useState } from 'preact/hooks';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Props {
  collection: string;
  slug: string;
  initialFrontmatter: Record<string, unknown>;
  initialBody: string;
}

const FIELDS = ['title', 'description', 'socialPost', 'tags', 'lastUpdated', 'featured'];

export default function AdminEditor({ collection, slug, initialFrontmatter, initialBody }: Props) {
  const [fm, setFm] = useState<Record<string, unknown>>(initialFrontmatter);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'ok' | 'error'; msg?: string; url?: string }>({ kind: 'idle' });

  const setField = (k: string, v: unknown) => setFm({ ...fm, [k]: v });

  async function publish() {
    setStatus({ kind: 'saving' });
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'lfd-editor' },
      body: JSON.stringify({ collection, slug, frontmatter: fm, body }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) setStatus({ kind: 'ok', msg: 'Publishing. Live in about a minute.', url: d.commitUrl });
    else setStatus({ kind: 'error', msg: d.error || 'Save failed' });
  }

  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="font-heading text-xl font-bold">Editing {collection}/{slug}</h1>
        <button onClick={publish} disabled={status.kind === 'saving'}
          class="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50">
          {status.kind === 'saving' ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {status.kind === 'ok' && (
        <p class="text-sm text-green-600 mb-3">{status.msg} {status.url && <a class="underline" href={status.url} target="_blank">View commit</a>}</p>
      )}
      {status.kind === 'error' && <p class="text-sm text-red-600 mb-3">{status.msg}</p>}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
        {FIELDS.filter(f => f in fm).map(f => (
          <label class="text-sm">
            <span class="block text-clinical-500 mb-1">{f}</span>
            <input
              class="w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
              value={Array.isArray(fm[f]) ? (fm[f] as unknown[]).join(', ') : String(fm[f] ?? '')}
              onInput={(e) => {
                const raw = (e.target as HTMLInputElement).value;
                if (Array.isArray(fm[f])) setField(f, raw.split(',').map(s => s.trim()).filter(Boolean));
                else if (typeof fm[f] === 'boolean') setField(f, raw === 'true');
                else setField(f, raw);
              }}
            />
          </label>
        ))}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          class="w-full h-[70vh] font-mono text-sm rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 p-3"
          value={body}
          onInput={(e) => setBody((e.target as HTMLTextAreaElement).value)}
        />
        <iframe
          title="preview" sandbox=""
          class="w-full h-[70vh] rounded border border-clinical-200 dark:border-clinical-700 bg-white"
          srcdoc={renderPreviewDoc(body)}
        />
      </div>
      <p class="text-xs text-clinical-400 mt-2">Preview renders standard markdown. Callout and PromptPlayground blocks appear as placeholders here and render fully after publish.</p>
    </div>
  );
}

function renderPreviewDoc(body: string): string {
  const placeheld = body
    .replace(/<Callout[^>]*>/g, '\n> **[Callout]**\n')
    .replace(/<\/Callout>/g, '\n')
    .replace(/<PromptPlayground[^>]*>/g, '\n> **[Prompt]**\n')
    .replace(/<\/PromptPlayground>/g, '\n')
    .replace(/^import .*$/gm, '');
  const safe = DOMPurify.sanitize(marked.parse(placeheld, { async: false }) as string);
  return `<!doctype html><html><head><meta charset="utf-8">
<style>body{font:16px/1.65 ui-sans-serif,system-ui;max-width:46rem;margin:1.5rem auto;padding:0 1rem;color:#1f2937}
h1,h2,h3{font-weight:700;line-height:1.25;margin:1.4em 0 .5em}code{background:#f3f0e8;padding:.1em .3em;border-radius:3px}
blockquote{border-left:3px solid #cbd5e1;margin:1em 0;padding:.2em 1em;color:#475569}</style></head>
<body>${safe}</body></html>`;
}
