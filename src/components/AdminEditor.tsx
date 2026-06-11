import { useState, useEffect } from 'preact/hooks';
import DOMPurify from 'dompurify';
import FieldInput from './FieldInput';
import { transformMdxForPreview, PREVIEW_CSS } from '../lib/preview-render';

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
  const [fm, setFm] = useState<Record<string, unknown>>(() => {
    if (mode === 'edit' && 'lastUpdated' in initialFrontmatter) {
      return { ...initialFrontmatter, lastUpdated: new Date().toISOString().slice(0, 10) };
    }
    return initialFrontmatter;
  });
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
    const fmToSend = isCreate && 'slug' in fm ? { ...fm, slug } : fm;
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'lfd-editor' },
      body: JSON.stringify({ collection, slug, frontmatter: fmToSend, body, create: isCreate }),
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
        {Object.keys(fm).map((k) => (
          <FieldInput key={k} collection={collection} k={k} v={fm[k]} isCreate={isCreate}
            onChange={(value) => setField(k, value)} />
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
          srcdoc={preview}
        />
      </div>
      <p class="text-xs text-clinical-400 mt-2">Preview approximates the live page, including Callouts. Interactive blocks (PromptPlayground) render as static boxes.</p>
    </div>
  );
}

function renderPreviewDoc(body: string): string {
  const safe = DOMPurify.sanitize(transformMdxForPreview(body));
  return `<!doctype html><html><head><meta charset="utf-8"><style>${PREVIEW_CSS}</style></head><body>${safe}</body></html>`;
}
