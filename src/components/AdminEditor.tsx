import { useState, useEffect } from 'preact/hooks';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Props {
  collection: string;
  slug: string;
  initialFrontmatter: Record<string, unknown>;
  initialBody: string;
  mode?: 'edit' | 'create';
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminEditor({ collection, slug: initialSlug, initialFrontmatter, initialBody, mode = 'edit' }: Props) {
  const isCreate = mode === 'create';
  const [fm, setFm] = useState<Record<string, unknown>>(initialFrontmatter);
  const [body, setBody] = useState(initialBody);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(false);
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'ok' | 'error'; msg?: string; url?: string; viewPath?: string }>({ kind: 'idle' });
  // Preview is computed in the browser only: DOMPurify needs a DOM, which the server does not have.
  const [preview, setPreview] = useState('');
  useEffect(() => { setPreview(renderPreviewDoc(body)); }, [body]);

  const setField = (k: string, v: unknown) => {
    setFm({ ...fm, [k]: v });
    if (isCreate && k === 'title' && !slugEdited) setSlug(slugify(String(v ?? '')));
  };

  async function publish() {
    if (isCreate && !/^[a-z0-9-]+$/.test(slug)) {
      setStatus({ kind: 'error', msg: 'Give the article a title first; the web address is built from it.' });
      return;
    }
    setStatus({ kind: 'saving' });
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'lfd-editor' },
      body: JSON.stringify({ collection, slug, frontmatter: fm, body, create: isCreate }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus({
        kind: 'ok',
        msg: isCreate ? 'Created. Live in about a minute.' : 'Publishing. Live in about a minute.',
        url: d.commitUrl,
        viewPath: `/${collection}/${slug}`,
      });
    } else {
      setStatus({ kind: 'error', msg: d.error || 'Save failed' });
    }
  }

  function renderField(k: string) {
    const v = fm[k];
    if (typeof v === 'boolean') {
      return (
        <label class="text-sm flex items-center gap-2 py-1">
          <input type="checkbox" checked={v} onInput={(e) => setField(k, (e.target as HTMLInputElement).checked)} />
          <span class="text-clinical-500">{k}</span>
        </label>
      );
    }
    if (typeof v === 'number') {
      const isRating = k === 'rating' && collection === 'tools';
      return (
        <label class="text-sm">
          <span class="block text-clinical-500 mb-1">{k}</span>
          <input type="number"
            min={isRating ? 0 : undefined}
            max={isRating ? 5 : undefined}
            class="w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
            value={String(v)}
            onInput={(e) => {
              const n = Number((e.target as HTMLInputElement).value);
              if (Number.isNaN(n)) { setField(k, v); return; }
              setField(k, isRating ? Math.min(5, Math.max(0, n)) : n);
            }} />
        </label>
      );
    }
    if (Array.isArray(v)) {
      return (
        <label class="text-sm">
          <span class="block text-clinical-500 mb-1">{k}</span>
          <input
            class="w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
            value={(v as unknown[]).join(', ')}
            onInput={(e) => setField(k, (e.target as HTMLInputElement).value.split(',').map((s) => s.trim()).filter(Boolean))} />
        </label>
      );
    }
    const display = v instanceof Date ? v.toISOString().slice(0, 10) : (v == null ? '' : String(v));
    return (
      <label class="text-sm">
        <span class="block text-clinical-500 mb-1">{k}</span>
        <input
          class="w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
          value={display}
          onInput={(e) => setField(k, (e.target as HTMLInputElement).value)} />
      </label>
    );
  }

  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="font-heading text-xl font-bold">{isCreate ? `New ${collection.replace(/s$/, '')}` : `Editing ${collection}/${slug}`}</h1>
        <div class="flex flex-col items-end gap-1">
          <button onClick={publish} disabled={status.kind === 'saving'}
            class="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50">
            {status.kind === 'saving' ? 'Saving...' : isCreate ? 'Create' : 'Publish'}
          </button>
          {!isCreate && (
            <a href={`/${collection}/${slug}`} target="_blank" rel="noopener noreferrer"
              class="text-sm text-blue-600 dark:text-blue-400 underline">
              See live document
            </a>
          )}
        </div>
      </div>

      {status.kind === 'ok' && (
        <p class="text-sm text-green-600 mb-3">
          {status.msg}{' '}
          {status.viewPath && <a class="underline" href={status.viewPath}>View page</a>}{' '}
          {status.url && <a class="underline" href={status.url} target="_blank" rel="noopener noreferrer">commit</a>}
        </p>
      )}
      {status.kind === 'error' && <p class="text-sm text-red-600 mb-3">{status.msg}</p>}

      {isCreate && (
        <label class="block text-sm mb-4">
          <span class="block text-clinical-500 mb-1">web address</span>
          <div class="flex items-center gap-1">
            <span class="text-clinical-400 text-sm">/{collection}/</span>
            <input
              class="flex-1 rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
              value={slug}
              onInput={(e) => { setSlugEdited(true); setSlug(slugify((e.target as HTMLInputElement).value)); }} />
          </div>
        </label>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
        {Object.keys(fm).map((k) => renderField(k))}
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
          srcdoc={preview}
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
