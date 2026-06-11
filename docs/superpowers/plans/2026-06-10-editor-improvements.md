# Web Editor Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin dashboard listing all content with creation for every collection, minimal-diff frontmatter saving, purpose-built field inputs, and a site-faithful preview.

**Architecture:** Pure logic lives in `src/lib/` (patchMdx, field templates, field config, preview transform) with vitest coverage; UI lives in Preact islands (`AdminDashboard`, `FieldInput`, updated `AdminEditor`); two thin Astro pages and one new API route wire them up. Edits are committed to GitHub via the existing save route, which switches from full re-serialization to a formatting-preserving YAML document patch.

**Tech Stack:** Astro 6 (SSR on Cloudflare Workers), Preact, TypeScript, `yaml` v2 (`parseDocument`), `marked` + DOMPurify, vitest.

**Spec:** `docs/superpowers/specs/2026-06-10-editor-improvements-design.md`

**Conventions:** Work on `main`. No em dashes anywhere (content lint). Run tests with `npx vitest run <file>`.

---

### Task 1: `patchMdx` minimal-diff serializer, wired into the save route

**Files:**
- Modify: `src/lib/mdx-file.ts`
- Modify: `src/pages/api/admin/save.ts` (edit path, lines 52-53 and 71-74)
- Test: `src/lib/mdx-file.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/mdx-file.test.ts` (import `patchMdx` alongside the existing imports from `./mdx-file`):

```ts
describe('patchMdx', () => {
  const ORIGINAL = `---
title: "OpenEvidence for Clinical Search"
slug: openevidence
vendor: "OpenEvidence"
rating: 3
order: 110
verdict: "Strong evidence retrieval, but verify BAA status before using with PHI"
pricing: "Free tier available"
hasBaa: false
categories: [clinical-reasoning, literature-review, general]
lastUpdated: 2026-03-18
socialPost: "OpenEvidence is a clinical AI search platform that surfaces peer-reviewed evidence summaries for point-of-care questions."
---

Body text here.
`;

  function fmOf(raw: string) {
    return parseMdx(raw).frontmatter;
  }

  it('changing one field leaves every other frontmatter line byte-identical', () => {
    const fm = { ...fmOf(ORIGINAL), rating: 4 };
    const out = patchMdx(ORIGINAL, fm, 'Body text here.');
    const beforeLines = ORIGINAL.split('\n');
    const afterLines = out.split('\n');
    expect(afterLines).toContain('rating: 4');
    for (const line of beforeLines) {
      if (line.startsWith('rating:')) continue;
      expect(afterLines).toContain(line);
    }
    // Quoted strings keep their quotes
    expect(out).toContain('title: "OpenEvidence for Clinical Search"');
    // Flow arrays stay flow
    expect(out).toContain('categories: [clinical-reasoning, literature-review, general]');
  });

  it('round-trips with no changes byte-identically in the frontmatter block', () => {
    const fm = fmOf(ORIGINAL);
    const out = patchMdx(ORIGINAL, fm, 'Body text here.');
    expect(out.split('---')[1]).toBe(ORIGINAL.split('---')[1]);
  });

  it('adds a new key and removes a deleted key', () => {
    const fm = { ...fmOf(ORIGINAL) } as Record<string, unknown>;
    delete fm.socialPost;
    fm.featured = true;
    const out = patchMdx(ORIGINAL, fm, 'Body text here.');
    expect(out).not.toContain('socialPost');
    expect(out).toContain('featured: true');
  });

  it('replaces the body wholesale', () => {
    const fm = fmOf(ORIGINAL);
    const out = patchMdx(ORIGINAL, fm, 'New body.');
    expect(parseMdx(out).body.trim()).toBe('New body.');
  });

  it('throws on input with no frontmatter', () => {
    expect(() => patchMdx('no frontmatter', {}, 'x')).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/mdx-file.test.ts`
Expected: FAIL with `patchMdx` not exported.

- [ ] **Step 3: Implement `patchMdx`**

In `src/lib/mdx-file.ts`, change the yaml import and add the function:

```ts
import { parse as yamlParse, stringify as yamlStringify, parseDocument } from 'yaml';
```

```ts
// Formatting-preserving update: only keys whose values changed are rewritten;
// untouched keys keep their original quote style, array layout, and wrapping.
export function patchMdx(
  originalRaw: string,
  frontmatter: Record<string, unknown>,
  body: string,
): string {
  const match = originalRaw.match(FRONTMATTER_RE);
  if (!match) throw new Error('No frontmatter block found');
  const doc = parseDocument(match[1]);
  const original = (doc.toJS() ?? {}) as Record<string, unknown>;

  for (const [key, value] of Object.entries(frontmatter)) {
    if (JSON.stringify(original[key]) !== JSON.stringify(value)) doc.set(key, value);
  }
  for (const key of Object.keys(original)) {
    if (!(key in frontmatter)) doc.delete(key);
  }

  const fm = doc.toString().trimEnd();
  return `---\n${fm}\n---\n\n${body.replace(/^\n+/, '')}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/mdx-file.test.ts`
Expected: PASS. If the no-change round-trip test fails because `doc.toString()` normalizes a final newline, adjust the test's expectation to compare trimmed blocks (`.trim()`), not the patch logic.

- [ ] **Step 5: Use `patchMdx` on the save route's edit path**

In `src/pages/api/admin/save.ts`:

Add `patchMdx` to the existing import:

```ts
import { isCollection, serializeMdx, patchMdx, validateContent, type CollectionName } from '../../../lib/mdx-file';
```

Move the `const text = serializeMdx(frontmatter, body);` line (currently just after `const path = ...`) into the create branch, and use `patchMdx` in the edit branch. The end of the POST handler becomes:

```ts
  const path = `src/content/${collection}/${slug}.mdx`;

  async function loadExisting(): Promise<{ text: string; sha: string } | null | Response> {
    try {
      return await getFile(cfg, path);
    } catch (e) {
      const m = e instanceof Error ? e.message : 'GitHub error';
      return json({ error: `Could not reach GitHub: ${m}` }, 502);
    }
  }

  if (create) {
    const existing = await loadExisting();
    if (existing instanceof Response) return existing;
    if (existing) return json({ error: 'An article with that address already exists' }, 409);
    return commit(cfg, path, serializeMdx(frontmatter, body), undefined, `content: create ${slug} via web editor`);
  }

  const existing = await loadExisting();
  if (existing instanceof Response) return existing;
  if (!existing) return json({ error: 'File not found; cannot create new files here' }, 404);
  return commit(cfg, path, patchMdx(existing.text, frontmatter, body), existing.sha, `content: edit ${slug} via web editor`);
```

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: PASS (currently 109 tests plus the 5 new ones).

- [ ] **Step 7: Commit**

```bash
git add src/lib/mdx-file.ts src/lib/mdx-file.test.ts src/pages/api/admin/save.ts
git commit -m "feat(editor): formatting-preserving frontmatter patch on edit saves"
```

---

### Task 2: Field templates and creation for every collection

**Files:**
- Create: `src/lib/field-templates.ts`
- Modify: `src/pages/admin/new/[collection].astro`
- Modify: `src/pages/api/admin/save.ts` (remove `CREATABLE` gate, lines 42-45)
- Modify: `src/components/AdminEditor.tsx` (sync frontmatter `slug` on create)
- Test: `src/lib/field-templates.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/field-templates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { templateFor } from './field-templates';
import { COLLECTIONS } from './mdx-file';

const REQUIRED: Record<string, string[]> = {
  editorials: ['title', 'description', 'tags', 'lastUpdated'],
  guides: ['title', 'description', 'tags', 'lastUpdated'],
  tools: ['title', 'slug', 'vendor', 'rating', 'verdict', 'pricing', 'hasBaa', 'categories', 'lastUpdated'],
  trials: ['title', 'journal', 'year', 'doi', 'keyFinding', 'lastUpdated', 'tags'],
  templates: ['title', 'category', 'targetTool', 'tags', 'lastUpdated'],
  workflows: ['title', 'category', 'tools', 'tags', 'timeToRead', 'lastUpdated'],
  videos: ['title', 'url', 'channel', 'summary', 'category', 'llm', 'topic', 'priority', 'dateAdded'],
};

describe('templateFor', () => {
  it('provides a template containing every required field for every collection', () => {
    for (const c of COLLECTIONS) {
      const t = templateFor(c);
      for (const field of REQUIRED[c]) {
        expect(Object.keys(t), `${c} missing ${field}`).toContain(field);
      }
    }
  });

  it('tools template follows the order and rating conventions', () => {
    const t = templateFor('tools');
    expect(t.rating).toBe(3);
    expect(typeof t.order).toBe('number');
  });

  it('dates default to today in YYYY-MM-DD', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(templateFor('guides').lastUpdated).toBe(today);
    expect(templateFor('videos').dateAdded).toBe(today);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/field-templates.test.ts`
Expected: FAIL, cannot resolve `./field-templates`.

- [ ] **Step 3: Implement the templates**

Create `src/lib/field-templates.ts`:

```ts
import type { CollectionName } from './mdx-file';

// Blank starting frontmatter for the create flow. Every REQUIRED field for the
// collection must be present so the editor renders an input for it.
export function templateFor(collection: CollectionName): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  const templates: Record<CollectionName, Record<string, unknown>> = {
    guides: { title: '', description: '', tags: [], lastUpdated: today, featured: false, socialPost: '' },
    editorials: { title: '', description: '', tags: ['editorial'], lastUpdated: today, featured: false, socialPost: '' },
    tools: {
      title: '', slug: '', vendor: '', rating: 3, order: 999, verdict: '', pricing: '',
      hasBaa: false, categories: [], lastUpdated: today, socialPost: '',
    },
    trials: { title: '', journal: '', year: new Date().getFullYear(), doi: '', keyFinding: '', tags: [], lastUpdated: today, socialPost: '' },
    templates: { title: '', category: '', targetTool: '', tags: [], lastUpdated: today, socialPost: '' },
    workflows: { title: '', category: '', tools: [], tags: [], timeToRead: 5, lastUpdated: today, socialPost: '' },
    videos: { title: '', url: '', channel: '', summary: '', category: '', llm: [], topic: [], priority: 3, dateAdded: today, socialPost: '' },
  };
  return templates[collection];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/field-templates.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Generalize the create page**

Replace the frontmatter section of `src/pages/admin/new/[collection].astro` (everything between the `---` fences) with:

```astro
---
export const prerender = false;
import BaseLayout from '../../../layouts/BaseLayout.astro';
import AdminEditor from '../../../components/AdminEditor.tsx';
import { isAuthed } from '../../../lib/admin-session';
import { isCollection } from '../../../lib/mdx-file';
import { templateFor } from '../../../lib/field-templates';

const { collection } = Astro.params;
if (!(await isAuthed(Astro.request.headers.get('Cookie')))) {
  return Astro.redirect(`/admin/login?redirect=/admin/new/${collection}`);
}
if (!collection || !isCollection(collection)) {
  return new Response('Unknown collection', { status: 404 });
}
const template = templateFor(collection);
---
```

The `<BaseLayout>` body is unchanged.

- [ ] **Step 6: Remove the CREATABLE gate**

In `src/pages/api/admin/save.ts`, delete these lines:

```ts
  const CREATABLE = ['guides', 'editorials'];
  if (create && !CREATABLE.includes(collection)) {
    return json({ error: 'New articles can only be guides or editorials' }, 400);
  }
```

- [ ] **Step 7: Sync the frontmatter slug field on create**

In `src/components/AdminEditor.tsx`, at the top of `publish()` after the slug validity check, add:

```ts
    const fmToSend = isCreate && 'slug' in fm ? { ...fm, slug } : fm;
```

and change the fetch body to use it:

```ts
      body: JSON.stringify({ collection, slug, frontmatter: fmToSend, body, create: isCreate }),
```

(Tools frontmatter has a `slug` field that must match the filename; other collections are unaffected because they have no `slug` key in their template.)

- [ ] **Step 8: Run suite and build**

Run: `npx vitest run && npm run build`
Expected: tests pass; build completes.

- [ ] **Step 9: Commit**

```bash
git add src/lib/field-templates.ts src/lib/field-templates.test.ts "src/pages/admin/new/[collection].astro" src/pages/api/admin/save.ts src/components/AdminEditor.tsx
git commit -m "feat(editor): create any collection with per-collection field templates"
```

---

### Task 3: Content index API

**Files:**
- Create: `src/pages/api/admin/content-index.ts`

- [ ] **Step 1: Implement the endpoint**

Create `src/pages/api/admin/content-index.ts`:

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isAuthed } from '../../../lib/admin-session';
import { COLLECTIONS } from '../../../lib/mdx-file';

export const prerender = false;

export interface ContentIndexItem {
  collection: string;
  slug: string;
  title: string;
  lastUpdated: string; // YYYY-MM-DD or ''
}

export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthed(request.headers.get('Cookie')))) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const items: ContentIndexItem[] = [];
  for (const collection of COLLECTIONS) {
    const entries = await getCollection(collection as Parameters<typeof getCollection>[0]);
    for (const entry of entries) {
      const data = entry.data as Record<string, unknown>;
      const raw = data.lastUpdated ?? data.dateAdded;
      const date =
        raw instanceof Date ? raw.toISOString().slice(0, 10) :
        typeof raw === 'string' ? raw.slice(0, 10) : '';
      items.push({
        collection,
        slug: entry.id,
        title: typeof data.title === 'string' && data.title ? data.title : entry.id,
        lastUpdated: date,
      });
    }
  }
  return json({ items }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
```

Note: `entry.id` is the slug for glob-loaded collections (filename without extension). If `astro check` rejects the `getCollection` parameter cast, use `getCollection(collection as 'guides')` with a one-line comment; the runtime accepts any valid collection name.

- [ ] **Step 2: Build to verify the route compiles**

Run: `npm run build`
Expected: build completes; the new route appears in the server manifest (no error output mentioning `content-index`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/admin/content-index.ts
git commit -m "feat(editor): admin content index endpoint across all collections"
```

---

### Task 4: Admin dashboard

**Files:**
- Create: `src/components/AdminDashboard.tsx`
- Modify: `src/pages/admin/index.astro` (full rewrite of the page body)

- [ ] **Step 1: Create the dashboard island**

Create `src/components/AdminDashboard.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'preact/hooks';

interface Item {
  collection: string;
  slug: string;
  title: string;
  lastUpdated: string;
}

const COLLECTION_ORDER = ['guides', 'editorials', 'tools', 'trials', 'templates', 'workflows', 'videos'];

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/admin/content-index', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const visible = (items ?? []).filter(
      (i) => !q || i.title.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q),
    );
    const map = new Map<string, Item[]>();
    for (const c of COLLECTION_ORDER) map.set(c, []);
    for (const i of visible) {
      if (!map.has(i.collection)) map.set(i.collection, []);
      map.get(i.collection)!.push(i);
    }
    for (const list of map.values()) list.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
    return map;
  }, [items, filter]);

  return (
    <div>
      <input
        class="w-full mb-6 rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-3 py-2 text-sm"
        placeholder="Filter by title or slug..."
        value={filter}
        onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
      />
      {error && <p class="text-sm text-red-600 mb-4">Could not load content list: {error}</p>}
      {!items && !error && <p class="text-sm text-clinical-400">Loading content list...</p>}
      {items && [...grouped.entries()].map(([collection, list]) => (
        <section key={collection} class="mb-8">
          <div class="flex items-baseline justify-between mb-2">
            <h2 class="font-heading text-xl font-semibold capitalize">
              {collection} <span class="text-sm font-normal text-clinical-400">({list.length})</span>
            </h2>
            <a href={`/admin/new/${collection}`} class="text-sm text-blue-600 dark:text-blue-400 underline">
              New {collection.replace(/s$/, '')}
            </a>
          </div>
          {list.length === 0 ? (
            <p class="text-sm text-clinical-400">None{filter ? ' matching filter' : ''}.</p>
          ) : (
            <ul class="divide-y divide-clinical-200 dark:divide-clinical-700 rounded-lg border border-clinical-200 dark:border-clinical-700 bg-warm-white dark:bg-clinical-800">
              {list.map((i) => (
                <li key={`${i.collection}/${i.slug}`}>
                  <a href={`/admin/edit/${i.collection}/${i.slug}`} class="flex items-center justify-between px-4 py-2 hover:bg-clinical-50 dark:hover:bg-clinical-700">
                    <span class="text-sm">{i.title}</span>
                    <span class="text-xs text-clinical-400 ml-4 shrink-0">{i.lastUpdated}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p class="text-xs text-clinical-400 mt-2">
        Articles created in the last minute may not appear until the next rebuild finishes.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite the admin index page**

Replace the full contents of `src/pages/admin/index.astro` with:

```astro
---
export const prerender = false;
import BaseLayout from '../../layouts/BaseLayout.astro';
import AdminDashboard from '../../components/AdminDashboard.tsx';
import { isAuthed } from '../../lib/admin-session';

if (!(await isAuthed(Astro.request.headers.get('Cookie')))) {
  return Astro.redirect('/admin/login?redirect=/admin');
}
---
<BaseLayout title="Admin" description="Admin">
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <h1 class="font-heading text-3xl font-bold">Content</h1>
      <form method="POST" action="/api/admin/logout">
        <button class="text-sm text-clinical-400 underline">Log out</button>
      </form>
    </div>
    <AdminDashboard client:load />
  </div>
  <script>
    document.querySelector('form[action="/api/admin/logout"]')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/';
    });
  </script>
</BaseLayout>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build completes with no errors mentioning AdminDashboard or admin/index.

- [ ] **Step 4: Commit**

```bash
git add src/components/AdminDashboard.tsx src/pages/admin/index.astro
git commit -m "feat(editor): admin dashboard listing all content with filter and create links"
```

---

### Task 5: Field config and purpose-built inputs

**Files:**
- Create: `src/lib/field-config.ts`
- Create: `src/components/FieldInput.tsx`
- Modify: `src/components/AdminEditor.tsx` (replace `renderField`, auto-set lastUpdated)
- Test: `src/lib/field-config.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/field-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { fieldKindFor, TOOL_CATEGORIES, VIDEO_CATEGORIES, WORKFLOW_CATEGORIES } from './field-config';

describe('fieldKindFor', () => {
  it('tools rating is a star picker 0-5', () => {
    expect(fieldKindFor('tools', 'rating')).toEqual({ kind: 'stars', min: 0, max: 5 });
  });

  it('tools categories are enum chips', () => {
    expect(fieldKindFor('tools', 'categories')).toEqual({ kind: 'chips-enum', options: TOOL_CATEGORIES });
  });

  it('workflow and video category are single selects', () => {
    expect(fieldKindFor('workflows', 'category')).toEqual({ kind: 'select', options: WORKFLOW_CATEGORIES });
    expect(fieldKindFor('videos', 'category')).toEqual({ kind: 'select', options: VIDEO_CATEGORIES });
  });

  it('tags are free chips and socialPost is a textarea in every collection', () => {
    expect(fieldKindFor('guides', 'tags')).toEqual({ kind: 'chips' });
    expect(fieldKindFor('tools', 'socialPost')).toEqual({ kind: 'textarea' });
    expect(fieldKindFor('trials', 'keyFinding')).toEqual({ kind: 'textarea' });
  });

  it('dates and numbers map to their inputs', () => {
    expect(fieldKindFor('guides', 'lastUpdated')).toEqual({ kind: 'date' });
    expect(fieldKindFor('videos', 'dateAdded')).toEqual({ kind: 'date' });
    expect(fieldKindFor('videos', 'priority')).toEqual({ kind: 'number', min: 1, max: 5 });
    expect(fieldKindFor('tools', 'order')).toMatchObject({ kind: 'number' });
  });

  it('slug is readonly and unknown fields return undefined', () => {
    expect(fieldKindFor('tools', 'slug')).toEqual({ kind: 'readonly' });
    expect(fieldKindFor('guides', 'someUnknownField')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/field-config.test.ts`
Expected: FAIL, cannot resolve `./field-config`.

- [ ] **Step 3: Implement the config**

Create `src/lib/field-config.ts`:

```ts
export const WORKFLOW_CATEGORIES = [
  'note-writing', 'clinical-reasoning', 'patient-education',
  'literature-review', 'admin-billing', 'board-prep',
] as const;
export const TOOL_CATEGORIES = [...WORKFLOW_CATEGORIES, 'general'] as const;
export const VIDEO_CATEGORIES = ['tutorial', 'lecture', 'demo', 'interview'] as const;

export type FieldKind =
  | { kind: 'stars'; min: number; max: number }
  | { kind: 'chips-enum'; options: readonly string[] }
  | { kind: 'chips' }
  | { kind: 'select'; options: readonly string[] }
  | { kind: 'textarea' }
  | { kind: 'date' }
  | { kind: 'number'; min?: number; max?: number; help?: string }
  | { kind: 'readonly' };

const CHIPS_FIELDS = new Set(['tags', 'llm', 'topic', 'tools', 'templates', 'trials', 'specialty']);
const TEXTAREA_FIELDS = new Set(['socialPost', 'verdict', 'description', 'summary', 'keyFinding']);
const DATE_FIELDS = new Set(['lastUpdated', 'dateAdded']);

export function fieldKindFor(collection: string, key: string): FieldKind | undefined {
  if (key === 'slug') return { kind: 'readonly' };
  if (collection === 'tools' && key === 'rating') return { kind: 'stars', min: 0, max: 5 };
  if (collection === 'tools' && key === 'categories') return { kind: 'chips-enum', options: TOOL_CATEGORIES };
  if (collection === 'workflows' && key === 'category') return { kind: 'select', options: WORKFLOW_CATEGORIES };
  if (collection === 'videos' && key === 'category') return { kind: 'select', options: VIDEO_CATEGORIES };
  if (collection === 'videos' && key === 'priority') return { kind: 'number', min: 1, max: 5 };
  if (collection === 'tools' && key === 'order') {
    return { kind: 'number', help: 'Position within a rating tier; lower appears first. Use multiples of 10.' };
  }
  if (CHIPS_FIELDS.has(key)) return { kind: 'chips' };
  if (TEXTAREA_FIELDS.has(key)) return { kind: 'textarea' };
  if (DATE_FIELDS.has(key)) return { kind: 'date' };
  if (key === 'timeToRead' || key === 'year') return { kind: 'number' };
  return undefined;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/field-config.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Create the FieldInput component**

Create `src/components/FieldInput.tsx`:

```tsx
import { useState } from 'preact/hooks';
import { fieldKindFor } from '../lib/field-config';

interface Props {
  collection: string;
  k: string;
  v: unknown;
  isCreate: boolean;
  onChange: (value: unknown) => void;
}

const inputCls = 'w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm';
const labelCls = 'block text-clinical-500 mb-1';

export default function FieldInput({ collection, k, v, isCreate, onChange }: Props) {
  const cfg = fieldKindFor(collection, k);

  if (cfg?.kind === 'readonly' && !isCreate) {
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input class={`${inputCls} opacity-60`} value={String(v ?? '')} readOnly disabled />
      </label>
    );
  }
  if (cfg?.kind === 'readonly' && isCreate) {
    // Slug is synced from the web-address field at publish time; hide it here.
    return null;
  }

  if (cfg?.kind === 'stars') {
    const current = typeof v === 'number' ? v : 0;
    return (
      <div class="text-sm">
        <span class={labelCls}>{k}</span>
        <div class="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" aria-label={`${star} stars`}
              class={`text-2xl leading-none ${star <= current ? 'text-amber-400' : 'text-clinical-300'}`}
              onClick={() => onChange(star)}>
              ★
            </button>
          ))}
          <button type="button" class="ml-2 text-xs text-clinical-400 underline" onClick={() => onChange(0)}>
            set 0 (warning)
          </button>
          <span class="ml-2 text-xs text-clinical-500">{current}/5</span>
        </div>
      </div>
    );
  }

  if (cfg?.kind === 'chips-enum') {
    const selected = Array.isArray(v) ? (v as string[]) : [];
    const toggle = (opt: string) =>
      onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
    return (
      <div class="text-sm">
        <span class={labelCls}>{k}</span>
        <div class="flex flex-wrap gap-1">
          {cfg.options.map((opt) => (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              class={`px-2 py-0.5 rounded-full text-xs border ${selected.includes(opt)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-clinical-300 dark:border-clinical-600 text-clinical-500'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cfg?.kind === 'chips') {
    const selected = Array.isArray(v) ? (v as string[]) : [];
    return <ChipsInput k={k} selected={selected} onChange={onChange} />;
  }

  if (cfg?.kind === 'select') {
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <select class={inputCls} value={String(v ?? '')}
          onInput={(e) => onChange((e.target as HTMLSelectElement).value)}>
          <option value="" disabled>choose...</option>
          {cfg.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </label>
    );
  }

  if (cfg?.kind === 'textarea') {
    const text = v == null ? '' : String(v);
    return (
      <label class="text-sm">
        <span class={labelCls}>{k} <span class="text-xs text-clinical-400">({text.length} chars)</span></span>
        <textarea class={`${inputCls} h-20`} value={text}
          onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)} />
      </label>
    );
  }

  if (cfg?.kind === 'date') {
    const display = v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? '').slice(0, 10);
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input type="date" class={inputCls} value={display}
          onInput={(e) => onChange((e.target as HTMLInputElement).value)} />
      </label>
    );
  }

  if (cfg?.kind === 'number') {
    const n = typeof v === 'number' ? v : 0;
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input type="number" class={inputCls} min={cfg.min} max={cfg.max} value={String(n)}
          onInput={(e) => {
            const parsed = Number((e.target as HTMLInputElement).value);
            if (Number.isNaN(parsed)) return;
            const clamped = Math.min(cfg.max ?? Infinity, Math.max(cfg.min ?? -Infinity, parsed));
            onChange(clamped);
          }} />
        {cfg.help && <span class="block text-xs text-clinical-400 mt-0.5">{cfg.help}</span>}
      </label>
    );
  }

  // Fallback: legacy type-inferred rendering for unknown fields.
  if (typeof v === 'boolean') {
    return (
      <label class="text-sm flex items-center gap-2 py-1">
        <input type="checkbox" checked={v} onInput={(e) => onChange((e.target as HTMLInputElement).checked)} />
        <span class="text-clinical-500">{k}</span>
      </label>
    );
  }
  if (typeof v === 'number') {
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input type="number" class={inputCls} value={String(v)}
          onInput={(e) => {
            const n = Number((e.target as HTMLInputElement).value);
            onChange(Number.isNaN(n) ? v : n);
          }} />
      </label>
    );
  }
  if (Array.isArray(v)) {
    return <ChipsInput k={k} selected={v as string[]} onChange={onChange} />;
  }
  const display = v instanceof Date ? v.toISOString().slice(0, 10) : (v == null ? '' : String(v));
  return (
    <label class="text-sm">
      <span class={labelCls}>{k}</span>
      <input class={inputCls} value={display}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)} />
    </label>
  );
}

function ChipsInput({ k, selected, onChange }: { k: string; selected: string[]; onChange: (v: unknown) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !selected.includes(t)) onChange([...selected, t]);
    setDraft('');
  };
  return (
    <div class="text-sm">
      <span class={labelCls}>{k}</span>
      <div class="flex flex-wrap items-center gap-1">
        {selected.map((s) => (
          <button key={s} type="button" title="Remove"
            class="px-2 py-0.5 rounded-full text-xs bg-clinical-100 dark:bg-clinical-700 border border-clinical-300 dark:border-clinical-600"
            onClick={() => onChange(selected.filter((x) => x !== s))}>
            {s} ✕
          </button>
        ))}
        <input class={`${inputCls} !w-32`} placeholder="add + Enter" value={draft}
          onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Wire FieldInput into AdminEditor and auto-set lastUpdated**

In `src/components/AdminEditor.tsx`:

Add the import:

```ts
import FieldInput from './FieldInput';
```

Change the `fm` state initializer so edit mode starts with today's date (visible and overridable):

```ts
  const [fm, setFm] = useState<Record<string, unknown>>(() => {
    if (mode === 'edit' && 'lastUpdated' in initialFrontmatter) {
      return { ...initialFrontmatter, lastUpdated: new Date().toISOString().slice(0, 10) };
    }
    return initialFrontmatter;
  });
```

Delete the entire `renderField` function (the `typeof v === 'boolean'` / number / array / string branches added over time), and replace its usage in the JSX:

```tsx
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
        {Object.keys(fm).map((k) => (
          <FieldInput key={k} collection={collection} k={k} v={fm[k]} isCreate={isCreate}
            onChange={(value) => setField(k, value)} />
        ))}
      </div>
```

(The rating clamp logic from the old number branch lives on in FieldInput's stars and number kinds; `fieldKindFor('tools','rating')` handles rating, so the special-case `isRating` code is gone.)

- [ ] **Step 7: Run suite and build**

Run: `npx vitest run && npm run build`
Expected: tests pass; build completes.

- [ ] **Step 8: Commit**

```bash
git add src/lib/field-config.ts src/lib/field-config.test.ts src/components/FieldInput.tsx src/components/AdminEditor.tsx
git commit -m "feat(editor): purpose-built field inputs driven by per-collection config"
```

---

### Task 6: Site-faithful preview

**Files:**
- Create: `src/lib/preview-render.ts`
- Modify: `src/components/AdminEditor.tsx` (replace `renderPreviewDoc`)
- Test: `src/lib/preview-render.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/preview-render.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { transformMdxForPreview, PREVIEW_CSS } from './preview-render';

describe('transformMdxForPreview', () => {
  it('renders a Callout as a styled aside with rendered inner markdown', () => {
    const src = '<Callout type="hipaa">\n  Do **not** paste PHI.\n</Callout>';
    const out = transformMdxForPreview(src);
    expect(out).toContain('class="callout callout-hipaa"');
    expect(out).toContain('HIPAA Notice');
    expect(out).toContain('<strong>not</strong>');
    expect(out).not.toContain('<Callout');
  });

  it('respects a custom Callout title', () => {
    const out = transformMdxForPreview('<Callout type="tip" title="Pro tip">x</Callout>');
    expect(out).toContain('Pro tip');
  });

  it('renders PromptPlayground as a styled prompt box', () => {
    const out = transformMdxForPreview('<PromptPlayground>\nSummarize this chart.\n</PromptPlayground>');
    expect(out).toContain('class="prompt-box"');
    expect(out).toContain('Summarize this chart.');
  });

  it('strips import statements and renders ordinary markdown', () => {
    const out = transformMdxForPreview("import Callout from '../../components/Callout.astro';\n\n## Heading\n");
    expect(out).not.toContain('import Callout');
    expect(out).toContain('<h2');
  });
});

describe('PREVIEW_CSS', () => {
  it('carries the site font and callout palettes', () => {
    expect(PREVIEW_CSS).toContain('Quadraat');
    expect(PREVIEW_CSS).toContain('.callout-hipaa');
    expect(PREVIEW_CSS).toContain('#fef2f2');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/preview-render.test.ts`
Expected: FAIL, cannot resolve `./preview-render`.

- [ ] **Step 3: Implement the preview renderer**

Create `src/lib/preview-render.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/preview-render.test.ts`
Expected: PASS (5 tests). If marked wraps the aside in `<p>` tags breaking the structure, ensure the replacement includes the surrounding blank lines (`\n\n`) shown above so marked treats it as an HTML block.

- [ ] **Step 5: Use the renderer in AdminEditor**

In `src/components/AdminEditor.tsx`:

Add the import:

```ts
import { transformMdxForPreview, PREVIEW_CSS } from '../lib/preview-render';
```

Replace the whole `renderPreviewDoc` function at the bottom of the file with:

```ts
function renderPreviewDoc(body: string): string {
  const safe = DOMPurify.sanitize(transformMdxForPreview(body));
  return `<!doctype html><html><head><meta charset="utf-8"><style>${PREVIEW_CSS}</style></head><body>${safe}</body></html>`;
}
```

Remove the now-unused `marked` import from AdminEditor.tsx (marked is used inside preview-render now). Update the helper text under the textarea:

```tsx
      <p class="text-xs text-clinical-400 mt-2">Preview approximates the live page, including Callouts. Interactive blocks (PromptPlayground) render as static boxes.</p>
```

- [ ] **Step 6: Run suite and build**

Run: `npx vitest run && npm run build`
Expected: tests pass; build completes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/preview-render.ts src/lib/preview-render.test.ts src/components/AdminEditor.tsx
git commit -m "feat(editor): site-faithful preview with styled callouts and prompt boxes"
```

---

### Task 7: Deploy and verify

**Files:** none (operational)

- [ ] **Step 1: Full suite and build**

Run: `npx vitest run && npm run build`
Expected: all tests pass; build completes.

- [ ] **Step 2: Push and deploy**

```bash
git push origin main
npm run deploy
```

(Per CLAUDE.md: always `npm run deploy`. If push is rejected, `git pull --rebase origin main` first; web-editor commits may have landed.)

- [ ] **Step 3: Verify routes respond**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://llmsfordoctors.com/admin            # expect 302 (login redirect)
curl -s https://llmsfordoctors.com/api/admin/content-index | head -c 80              # expect {"error":"Unauthorized"}
```

- [ ] **Step 4: Owner verifies in the browser** (requires admin password)

1. Log in at /admin: dashboard lists all 7 collections with counts; filter narrows the list.
2. Open a tool: rating renders as stars, categories as chips, socialPost as a textarea, lastUpdated pre-set to today.
3. Change the rating by one star, publish, and check the commit on GitHub: the diff should touch only the `rating:` and `lastUpdated:` lines.
4. Create a test trial from the dashboard, publish, confirm it goes live, then delete it locally (`git rm src/content/trials/<slug>.mdx`, commit, push, deploy) or leave it if useful.
5. Check the preview pane on an article with Callouts: styled boxes, site serif typography.

---

## Self-Review Notes

- Spec coverage: dashboard + index endpoint (Tasks 3-4), create-any-collection + templates (Task 2), patchMdx minimal diffs (Task 1), field config/inputs + lastUpdated auto-set (Task 5), preview (Task 6), deploy/UAT (Task 7). All spec sections covered.
- Type consistency: `templateFor`, `fieldKindFor`, `patchMdx`, `transformMdxForPreview`, `PREVIEW_CSS`, `ContentIndexItem` named consistently across tasks.
- The old `renderField` and `renderPreviewDoc` bodies are fully replaced; no dangling references (marked import removed from AdminEditor in Task 6).
