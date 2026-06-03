# Web Content Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a login-gated editor on the live site that lets the owner edit existing articles in a markdown view with live preview, then publish by committing to GitHub and auto-deploying.

**Architecture:** Pure, unit-tested libraries (`src/lib/`) hold all logic: frontmatter parse/serialize/validate, password/session/rate-limit auth over Cloudflare KV, and a thin GitHub Contents API client. Thin Astro API routes and a Preact editor island sit on top. A path-scoped GitHub Action redeploys on content commits.

**Tech Stack:** Astro 6 (output static, `@astrojs/cloudflare` adapter, SSR routes via `prerender = false`), Cloudflare Workers + KV, Preact island, Web Crypto (PBKDF2, random tokens), `yaml` (frontmatter), `marked` + `dompurify` (sanitized preview shown inside a sandboxed iframe), vitest, GitHub Contents API, GitHub Actions + `cloudflare/wrangler-action`.

Repo facts the implementer must know:
- Bindings/env are read with `import { env } from 'cloudflare:workers'` (see `src/pages/api/refresh-news.ts`). Do NOT use `locals.runtime.env`.
- The real deploy is `npm run deploy` = `astro build` + `node scripts/post-build.mjs` + `wrangler deploy --config dist/server/wrangler.json`. `post-build.mjs` patches `dist/server/wrangler.json` with the cron and KV bindings; a deploy that skips it ships without them.
- Tests run via `npm test` (vitest), discovered as `src/**/*.test.ts`.
- GitHub repo: owner `jasongusdorf`, repo `llmsfordoctors`, branch `main`.
- No em dash character (U+2014) may appear in committed content; the save path enforces this.

---

## File structure

Create:
- `src/lib/mdx-file.ts`: parse/serialize/validate `.mdx`. Pure.
- `src/lib/mdx-file.test.ts`
- `src/lib/admin-auth.ts`: password hashing, session create/validate/delete, login rate-limit. Takes a KV namespace as an argument.
- `src/lib/admin-auth.test.ts`
- `src/lib/github-content.ts`: `getFile` / `putFile` against GitHub Contents API. Takes `fetch`; mockable.
- `src/lib/github-content.test.ts`
- `src/lib/test-helpers.ts`: `createMockKV()` for tests.
- `src/lib/admin-session.ts`: route-facing helpers (env + cookies).
- `src/pages/api/admin/login.ts`, `logout.ts`, `save.ts`
- `src/pages/admin/login.astro`
- `src/pages/admin/edit/[collection]/[slug].astro`
- `src/components/AdminEditor.tsx`: Preact island: body textarea + frontmatter form + sandboxed-iframe preview + Publish.
- `src/components/AdminEditButton.astro`: floating Edit link, shown only when session valid.
- `scripts/hash-password.mjs`
- `.github/workflows/deploy-content.yml`

Modify:
- `package.json`: add `yaml`, `marked`, `dompurify`.
- `wrangler.jsonc`: add `ADMIN_STORE` KV binding.
- `scripts/post-build.mjs`: patch `ADMIN_STORE` into generated wrangler.json.
- collection detail pages: include `<AdminEditButton>`.
- `.github/workflows/daily-news-build.yml`: run `post-build.mjs` before deploy.

Shared constants (defined in `src/lib/mdx-file.ts`, imported elsewhere):

```ts
export const COLLECTIONS = ['editorials', 'guides', 'tools', 'trials', 'templates', 'workflows', 'videos'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];
```

---

## Task 1: MDX file library (parse / serialize / validate)

**Files:**
- Create: `src/lib/mdx-file.ts`
- Test: `src/lib/mdx-file.test.ts`

- [ ] **Step 1: Add the `yaml` dependency**

Run: `npm install yaml@^2.6.0`
Expected: `yaml` in `package.json` dependencies.

- [ ] **Step 2: Write failing tests**

Create `src/lib/mdx-file.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseMdx, serializeMdx, validateContent } from './mdx-file';

const SAMPLE = `---
title: "Hello"
description: "A test"
tags: [a, b]
lastUpdated: 2026-06-03
featured: false
---

Body line one.

Body line two.
`;

describe('parseMdx', () => {
  it('splits frontmatter and body', () => {
    const { frontmatter, body } = parseMdx(SAMPLE);
    expect(frontmatter.title).toBe('Hello');
    expect(frontmatter.tags).toEqual(['a', 'b']);
    expect(body.trim().startsWith('Body line one.')).toBe(true);
  });

  it('throws on a file with no frontmatter block', () => {
    expect(() => parseMdx('no frontmatter here')).toThrow();
  });
});

describe('serializeMdx', () => {
  it('round-trips parse then serialize to equivalent content', () => {
    const { frontmatter, body } = parseMdx(SAMPLE);
    const out = parseMdx(serializeMdx(frontmatter, body));
    expect(out.frontmatter.title).toBe('Hello');
    expect(out.body.trim()).toBe('Body line one.\n\nBody line two.');
  });

  it('produces a leading and trailing frontmatter fence', () => {
    const text = serializeMdx({ title: 'X' }, 'Body');
    expect(text.startsWith('---\n')).toBe(true);
    expect(text).toContain('\n---\n');
  });
});

describe('validateContent', () => {
  it('passes a valid guide', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
    }, 'Body');
    expect(errors).toEqual([]);
  });

  it('flags a missing required field', () => {
    const errors = validateContent('guides', { title: 'T' }, 'Body');
    expect(errors.some(e => e.includes('description'))).toBe(true);
  });

  it('rejects an em dash in the body', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
    }, 'A sentence \u2014 with an em dash.');
    expect(errors.some(e => e.toLowerCase().includes('em dash'))).toBe(true);
  });

  it('rejects a socialPost longer than 256 chars', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
      socialPost: 'x'.repeat(257),
    }, 'Body');
    expect(errors.some(e => e.includes('256'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/lib/mdx-file.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `src/lib/mdx-file.ts`**

Note: write the em-dash test value as the escape `'\u2014'`, so the source file stays em-dash-free.

```ts
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';

export const COLLECTIONS = ['editorials', 'guides', 'tools', 'trials', 'templates', 'workflows', 'videos'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

export interface ParsedMdx {
  frontmatter: Record<string, unknown>;
  body: string;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;
const EM_DASH = '\u2014';

export function parseMdx(raw: string): ParsedMdx {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) throw new Error('No frontmatter block found');
  const frontmatter = (yamlParse(match[1]) ?? {}) as Record<string, unknown>;
  const body = raw.slice(match[0].length);
  return { frontmatter, body };
}

export function serializeMdx(frontmatter: Record<string, unknown>, body: string): string {
  const fm = yamlStringify(frontmatter).trimEnd();
  return `---\n${fm}\n---\n\n${body.replace(/^\n+/, '')}`;
}

const REQUIRED: Record<CollectionName, string[]> = {
  editorials: ['title', 'description', 'tags', 'lastUpdated'],
  guides: ['title', 'description', 'tags', 'lastUpdated'],
  tools: ['title', 'slug', 'vendor', 'rating', 'verdict', 'pricing', 'hasBaa', 'categories', 'lastUpdated'],
  trials: ['title', 'journal', 'year', 'doi', 'keyFinding', 'lastUpdated', 'tags'],
  templates: ['title', 'category', 'targetTool', 'tags', 'lastUpdated'],
  workflows: ['title', 'category', 'tools', 'tags', 'timeToRead', 'lastUpdated'],
  videos: ['title', 'url', 'channel', 'summary', 'category'],
};

export function isCollection(name: string): name is CollectionName {
  return (COLLECTIONS as readonly string[]).includes(name);
}

export function validateContent(
  collection: CollectionName,
  frontmatter: Record<string, unknown>,
  body: string,
): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED[collection]) {
    const v = frontmatter[field];
    if (v === undefined || v === null || v === '') errors.push(`Missing required field: ${field}`);
  }

  const fmText = JSON.stringify(frontmatter);
  if (body.includes(EM_DASH) || fmText.includes(EM_DASH)) {
    errors.push('Contains an em dash (U+2014); use a colon, comma, semicolon, or hyphen instead');
  }

  const social = frontmatter.socialPost;
  if (typeof social === 'string' && social.length > 256) {
    errors.push(`socialPost is ${social.length} chars; max is 256`);
  }

  return errors;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/lib/mdx-file.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/mdx-file.ts src/lib/mdx-file.test.ts
git commit -m "feat(editor): mdx parse/serialize/validate library"
```

---

## Task 2: Admin auth library (password, sessions, rate limit)

**Files:**
- Create: `src/lib/admin-auth.ts`, `src/lib/test-helpers.ts`
- Test: `src/lib/admin-auth.test.ts`

- [ ] **Step 1: Write the mock KV helper**

Create `src/lib/test-helpers.ts`:

```ts
// In-memory stand-in for a Cloudflare KVNamespace. expirationTtl is recorded but not enforced;
// tests needing expiry write an expiresAt in the value directly.
export function createMockKV() {
  const store = new Map<string, string>();
  return {
    store,
    async get(key: string) { return store.has(key) ? store.get(key)! : null; },
    async put(key: string, value: string, _opts?: { expirationTtl?: number }) { store.set(key, value); },
    async delete(key: string) { store.delete(key); },
  };
}
export type MockKV = ReturnType<typeof createMockKV>;
```

- [ ] **Step 2: Write failing tests**

Create `src/lib/admin-auth.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  hashPassword, verifyPassword,
  createSession, validateSession, deleteSession,
  recordLoginFailure, isRateLimited,
} from './admin-auth';
import { createMockKV } from './test-helpers';

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct horse');
    expect(await verifyPassword('correct horse', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('sessions', () => {
  it('creates, validates, and deletes a session', async () => {
    const kv = createMockKV();
    const token = await createSession(kv as any);
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(await validateSession(kv as any, token)).toBe(true);
    await deleteSession(kv as any, token);
    expect(await validateSession(kv as any, token)).toBe(false);
  });

  it('rejects an unknown token', async () => {
    const kv = createMockKV();
    expect(await validateSession(kv as any, 'nope')).toBe(false);
  });

  it('rejects an expired session', async () => {
    const kv = createMockKV();
    await kv.put('session:expired', JSON.stringify({ createdAt: 0, expiresAt: 1 }));
    expect(await validateSession(kv as any, 'expired')).toBe(false);
  });
});

describe('rate limiting', () => {
  it('blocks after 5 failures for an ip', async () => {
    const kv = createMockKV();
    expect(await isRateLimited(kv as any, '1.2.3.4')).toBe(false);
    for (let i = 0; i < 5; i++) await recordLoginFailure(kv as any, '1.2.3.4');
    expect(await isRateLimited(kv as any, '1.2.3.4')).toBe(true);
    expect(await isRateLimited(kv as any, '9.9.9.9')).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/lib/admin-auth.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement `src/lib/admin-auth.ts`**

```ts
// Auth primitives over a Cloudflare KV namespace. KV is passed in so this is unit-testable.

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const RATE_WINDOW_SECONDS = 15 * 60;
const RATE_MAX_FAILURES = 5;
const PBKDF2_ITERATIONS = 100_000;

function toHex(bytes: Uint8Array): string {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256,
  );
  return toHex(new Uint8Array(bits));
}

/** Returns "iterations:saltHex:hashHex". */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${await pbkdf2(password, salt)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  return constantTimeEqual(await pbkdf2(password, fromHex(saltHex)), hashHex);
}

export async function createSession(kv: KV): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  await kv.put(`session:${token}`, JSON.stringify({ createdAt: now, expiresAt: now + SESSION_TTL_SECONDS * 1000 }),
    { expirationTtl: SESSION_TTL_SECONDS });
  return token;
}

export async function validateSession(kv: KV, token: string): Promise<boolean> {
  if (!token) return false;
  const raw = await kv.get(`session:${token}`);
  if (!raw) return false;
  try {
    const { expiresAt } = JSON.parse(raw) as { expiresAt: number };
    return Date.now() < expiresAt;
  } catch { return false; }
}

export async function deleteSession(kv: KV, token: string): Promise<void> {
  await kv.delete(`session:${token}`);
}

export async function recordLoginFailure(kv: KV, ip: string): Promise<void> {
  const key = `login_fail:${ip}`;
  const current = parseInt((await kv.get(key)) ?? '0', 10);
  await kv.put(key, String(current + 1), { expirationTtl: RATE_WINDOW_SECONDS });
}

export async function isRateLimited(kv: KV, ip: string): Promise<boolean> {
  return parseInt((await kv.get(`login_fail:${ip}`)) ?? '0', 10) >= RATE_MAX_FAILURES;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/lib/admin-auth.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin-auth.ts src/lib/admin-auth.test.ts src/lib/test-helpers.ts
git commit -m "feat(editor): admin auth library (password, sessions, rate limit)"
```

---

## Task 3: GitHub content client

**Files:**
- Create: `src/lib/github-content.ts`
- Test: `src/lib/github-content.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/github-content.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { getFile, putFile } from './github-content';

const cfg = { token: 't', owner: 'jasongusdorf', repo: 'llmsfordoctors' };

describe('getFile', () => {
  it('fetches and decodes file content + sha', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ content: btoa('hello world'), sha: 'abc123' }), { status: 200 }));
    const res = await getFile(cfg, 'src/content/guides/x.mdx', fetchMock as any);
    expect(res!.text).toBe('hello world');
    expect(res!.sha).toBe('abc123');
    expect(fetchMock.mock.calls[0][0] as string).toContain('/repos/jasongusdorf/llmsfordoctors/contents/src/content/guides/x.mdx');
  });

  it('returns null on 404', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 404 }));
    expect(await getFile(cfg, 'src/content/guides/missing.mdx', fetchMock as any)).toBeNull();
  });
});

describe('putFile', () => {
  it('PUTs base64 content with sha and returns commit url', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ commit: { html_url: 'https://github.com/commit/1' } }), { status: 200 }));
    const out = await putFile(cfg, 'src/content/guides/x.mdx', 'new body', 'abc123', 'msg', fetchMock as any);
    expect(out.commitUrl).toBe('https://github.com/commit/1');
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(atob(body.content)).toBe('new body');
    expect(body.sha).toBe('abc123');
    expect(body.branch).toBe('main');
  });

  it('throws on a 409 conflict', async () => {
    const fetchMock = vi.fn(async () => new Response('{"message":"conflict"}', { status: 409 }));
    await expect(putFile(cfg, 'src/content/guides/x.mdx', 'b', 'stale', 'msg', fetchMock as any)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/github-content.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/github-content.ts`**

```ts
export interface GithubConfig { token: string; owner: string; repo: string; }

const API = 'https://api.github.com';

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'llmsfordoctors-editor',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function b64ToText(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
function textToB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function getFile(
  cfg: GithubConfig, path: string, fetchFn: typeof fetch = fetch,
): Promise<{ text: string; sha: string } | null> {
  const res = await fetchFn(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=main`, { headers: headers(cfg.token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFile failed: ${res.status}`);
  const json = await res.json() as { content: string; sha: string };
  return { text: b64ToText(json.content), sha: json.sha };
}

export async function putFile(
  cfg: GithubConfig, path: string, text: string, sha: string, message: string, fetchFn: typeof fetch = fetch,
): Promise<{ commitUrl: string }> {
  const res = await fetchFn(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(cfg.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: textToB64(text), sha, branch: 'main' }),
  });
  if (!res.ok) throw new Error(`GitHub putFile failed: ${res.status}`);
  const json = await res.json() as { commit: { html_url: string } };
  return { commitUrl: json.commit.html_url };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/github-content.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/github-content.ts src/lib/github-content.test.ts
git commit -m "feat(editor): github contents api client"
```

---

## Task 4: KV namespace and config wiring

**Files:**
- Modify: `wrangler.jsonc`, `scripts/post-build.mjs`, `.dev.vars`

- [ ] **Step 1: Create the KV namespace**

Run: `npx wrangler kv namespace create ADMIN_STORE`
Expected: prints an `id`; copy it. (If the runner cannot, the owner runs this and supplies the id.)

- [ ] **Step 2: Add the binding to `wrangler.jsonc`** (use the id from Step 1)

```jsonc
    {
      "binding": "ADMIN_STORE",
      "id": "<ADMIN_STORE_ID>"
    }
```

- [ ] **Step 3: Patch the binding into the deploy output**

Read `scripts/post-build.mjs`. Find where it adds the `NEWS_CACHE` binding to the generated `wrangler.json` `kv_namespaces` array; add an `ADMIN_STORE` entry alongside with the same id. Mirror the existing patch exactly.

- [ ] **Step 4: Add local dev vars**

Append to `.dev.vars` (real values in Task 10; empty placeholders keep dev from crashing):

```
ADMIN_PASSWORD_HASH=
GITHUB_TOKEN=
GITHUB_OWNER=jasongusdorf
GITHUB_REPO=llmsfordoctors
```

- [ ] **Step 5: Verify the build still succeeds**

Run: `npm run build && grep ADMIN_STORE dist/server/wrangler.json`
Expected: build completes; grep shows the binding.

- [ ] **Step 6: Commit**

```bash
git add wrangler.jsonc scripts/post-build.mjs
git commit -m "chore(editor): add ADMIN_STORE kv binding to config and deploy patch"
```

---

## Task 5: Session helper, login and logout routes

**Files:**
- Create: `src/lib/admin-session.ts`, `src/pages/api/admin/login.ts`, `src/pages/api/admin/logout.ts`

- [ ] **Step 1: Implement `src/lib/admin-session.ts`**

```ts
import { env } from 'cloudflare:workers';
import { validateSession } from './admin-auth';

export const SESSION_COOKIE = 'lfd_admin';

export function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export async function isAuthed(cookieHeader: string | null): Promise<boolean> {
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  if (!token) return false;
  return validateSession((env as any).ADMIN_STORE, token);
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}
```

- [ ] **Step 2: Implement `src/pages/api/admin/login.ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyPassword, createSession, recordLoginFailure, isRateLimited } from '../../../lib/admin-auth';
import { SESSION_COOKIE, clientIp } from '../../../lib/admin-session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const kv = (env as any).ADMIN_STORE;
  const ip = clientIp(request);
  if (await isRateLimited(kv, ip)) return json({ error: 'Too many attempts. Try again later.' }, 429);

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const stored = (env as any).ADMIN_PASSWORD_HASH as string | undefined;
  if (!password || !stored || !(await verifyPassword(password, stored))) {
    await recordLoginFailure(kv, ip);
    return json({ error: 'Invalid password' }, 401);
  }

  const token = await createSession(kv);
  cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 7 * 24 * 60 * 60 });
  return json({ ok: true }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
```

- [ ] **Step 3: Implement `src/pages/api/admin/logout.ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteSession } from '../../../lib/admin-auth';
import { SESSION_COOKIE, readCookie } from '../../../lib/admin-session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = readCookie(request.headers.get('Cookie'), SESSION_COOKIE);
  if (token) await deleteSession((env as any).ADMIN_STORE, token);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 4: Typecheck**

Run: `npx astro check`
Expected: no new errors in the new files.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-session.ts src/pages/api/admin/login.ts src/pages/api/admin/logout.ts
git commit -m "feat(editor): session helper, login and logout routes"
```

---

## Task 6: Save API route

**Files:**
- Create: `src/pages/api/admin/save.ts`

- [ ] **Step 1: Implement `src/pages/api/admin/save.ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isCollection, serializeMdx, validateContent, type CollectionName } from '../../../lib/mdx-file';
import { getFile, putFile, type GithubConfig } from '../../../lib/github-content';
import { isAuthed } from '../../../lib/admin-session';

export const prerender = false;

const SLUG_RE = /^[a-z0-9-]+$/;

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('X-Requested-With') !== 'lfd-editor') return json({ error: 'Bad request' }, 400);
  if (!(await isAuthed(request.headers.get('Cookie')))) return json({ error: 'Unauthorized' }, 401);

  const { collection, slug, frontmatter, body } = (await request.json().catch(() => ({}))) as {
    collection?: string; slug?: string; frontmatter?: Record<string, unknown>; body?: string;
  };

  if (!collection || !isCollection(collection)) return json({ error: 'Unknown collection' }, 400);
  if (!slug || !SLUG_RE.test(slug)) return json({ error: 'Invalid slug' }, 400);
  if (!frontmatter || typeof body !== 'string') return json({ error: 'Missing content' }, 400);

  const errors = validateContent(collection as CollectionName, frontmatter, body);
  if (errors.length) return json({ error: errors.join('; ') }, 400);

  const cfg: GithubConfig = {
    token: (env as any).GITHUB_TOKEN,
    owner: (env as any).GITHUB_OWNER ?? 'jasongusdorf',
    repo: (env as any).GITHUB_REPO ?? 'llmsfordoctors',
  };
  const path = `src/content/${collection}/${slug}.mdx`;

  const existing = await getFile(cfg, path);
  if (!existing) return json({ error: 'File not found; cannot create new files here' }, 404);

  const text = serializeMdx(frontmatter, body);
  try {
    const { commitUrl } = await putFile(cfg, path, text, existing.sha, `content: edit ${slug} via web editor`);
    return json({ ok: true, commitUrl }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Commit failed';
    const conflict = msg.includes('409');
    return json({ error: conflict ? 'File changed since you loaded it; reload and retry' : msg }, conflict ? 409 : 500);
  }
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx astro check`
Expected: no new errors in `src/pages/api/admin/save.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/admin/save.ts
git commit -m "feat(editor): save api route (validate + commit to github)"
```

---

## Task 7: Login page and editor page

**Files:**
- Create: `src/pages/admin/login.astro`, `src/pages/admin/edit/[collection]/[slug].astro`
- Modify: `package.json` (add `marked`, `dompurify`)

- [ ] **Step 1: Add preview dependencies**

Run: `npm install marked@^14.1.0 dompurify@^3.1.7 && npm install -D @types/dompurify@^3.0.5`
Expected: `marked` and `dompurify` in dependencies, types in devDependencies.

- [ ] **Step 2: Implement `src/pages/admin/login.astro`**

```astro
---
export const prerender = false;
import BaseLayout from '../../layouts/BaseLayout.astro';
import { isAuthed } from '../../lib/admin-session';

const redirect = Astro.url.searchParams.get('redirect') ?? '/';
if (await isAuthed(Astro.request.headers.get('Cookie'))) return Astro.redirect(redirect);
---

<BaseLayout title="Admin Login" description="Admin login">
  <div class="max-w-sm mx-auto px-4 py-20">
    <h1 class="font-heading text-2xl font-bold mb-6">Admin Login</h1>
    <form id="login-form" class="space-y-4">
      <input type="password" id="password" name="password" required placeholder="Password"
        class="w-full rounded-md border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-3 py-2 text-sm" />
      <button type="submit" class="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">Sign in</button>
      <p id="login-error" class="text-sm text-red-600 hidden"></p>
    </form>
  </div>
  <script define:vars={{ redirect }}>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const err = document.getElementById('login-error');
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      if (res.ok) { window.location.href = redirect; }
      else { const d = await res.json().catch(() => ({})); err.textContent = d.error || 'Login failed'; err.classList.remove('hidden'); }
    });
  </script>
</BaseLayout>
```

- [ ] **Step 3: Implement `src/pages/admin/edit/[collection]/[slug].astro`**

```astro
---
export const prerender = false;
import { env } from 'cloudflare:workers';
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import AdminEditor from '../../../../components/AdminEditor.tsx';
import { isAuthed } from '../../../../lib/admin-session';
import { isCollection, parseMdx } from '../../../../lib/mdx-file';
import { getFile, type GithubConfig } from '../../../../lib/github-content';

const { collection, slug } = Astro.params;
const here = Astro.url.pathname;

if (!(await isAuthed(Astro.request.headers.get('Cookie')))) {
  return Astro.redirect(`/admin/login?redirect=${encodeURIComponent(here)}`);
}
if (!collection || !isCollection(collection) || !slug) return new Response('Not found', { status: 404 });

const cfg: GithubConfig = {
  token: (env as any).GITHUB_TOKEN,
  owner: (env as any).GITHUB_OWNER ?? 'jasongusdorf',
  repo: (env as any).GITHUB_REPO ?? 'llmsfordoctors',
};
const file = await getFile(cfg, `src/content/${collection}/${slug}.mdx`);
if (!file) return new Response('Article not found', { status: 404 });
const { frontmatter, body } = parseMdx(file.text);
---

<BaseLayout title={`Edit: ${slug}`} description="Editor">
  <AdminEditor client:load collection={collection} slug={slug} initialFrontmatter={frontmatter} initialBody={body} />
</BaseLayout>
```

- [ ] **Step 4: Commit (component arrives in Task 8; build verified there)**

```bash
git add package.json package-lock.json src/pages/admin/login.astro "src/pages/admin/edit/[collection]/[slug].astro"
git commit -m "feat(editor): login page and editor page shell"
```

---

## Task 8: Editor island and Edit button

**Files:**
- Create: `src/components/AdminEditor.tsx`, `src/components/AdminEditButton.astro`
- Modify: each collection detail page to include `<AdminEditButton>`

- [ ] **Step 1: Implement `src/components/AdminEditor.tsx`**

The preview renders `marked` output, sanitizes it with DOMPurify, and displays it inside a sandboxed iframe (`sandbox=""` disables scripts; the `srcdoc` attribute carries the sanitized HTML). This isolates preview content from the page and avoids any raw-HTML injection into the app DOM.

```tsx
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
```

- [ ] **Step 2: Implement `src/components/AdminEditButton.astro`**

```astro
---
import { isAuthed } from '../lib/admin-session';
interface Props { collection: string; slug: string; }
const { collection, slug } = Astro.props;
const show = await isAuthed(Astro.request.headers.get('Cookie'));
---
{show && (
  <a href={`/admin/edit/${collection}/${slug}`}
    class="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-clinical-900 text-white text-sm font-semibold shadow-lg hover:bg-clinical-800">
    Edit
  </a>
)}
```

- [ ] **Step 3: Add the button to each detail page**

Confirm filenames and the per-page entry variable first:

Run: `ls src/pages/editorials src/pages/guides src/pages/tools src/pages/trials src/pages/templates src/pages/workflows`
Run: `grep -n "getStaticPaths\|const entry\|const post\|getEntry" src/pages/guides/*.astro`

For each detail page (`editorials`, `guides`, `tools`, `trials`, `templates`, `workflows`):
1. Add `export const prerender = false;` if absent (so the per-request session check runs). If the page uses `getStaticPaths`, prefer loading the single entry per request via `getEntry(collection, slug)`; otherwise use the static fallback in Step 3a.
2. Import: `import AdminEditButton from '../../components/AdminEditButton.astro';`
3. Before the closing layout tag, render with that page's collection and entry id, e.g. in `guides/[...slug].astro`: `<AdminEditButton collection="guides" slug={entry.id} />` (use the file's actual entry variable name).

- [ ] **Step 3a (only if a detail page must remain static): client-side button fallback**

Create `src/pages/api/admin/whoami.ts`:

```ts
import type { APIRoute } from 'astro';
import { isAuthed } from '../../../lib/admin-session';
export const prerender = false;
export const GET: APIRoute = async ({ request }) =>
  new Response(JSON.stringify({ authed: await isAuthed(request.headers.get('Cookie')) }),
    { headers: { 'Content-Type': 'application/json' } });
```

On the static page, render a hidden link and reveal it client-side:

```astro
<a id="admin-edit" href={`/admin/edit/guides/${entry.id}`} class="hidden fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-clinical-900 text-white text-sm font-semibold shadow-lg">Edit</a>
<script>
  fetch('/api/admin/whoami').then(r => r.json()).then(d => { if (d.authed) document.getElementById('admin-edit')?.classList.remove('hidden'); });
</script>
```

- [ ] **Step 4: Build and manual verification**

Run: `npm run build`
Expected: build succeeds.

Then `npm run dev`, log in at `/admin/login`, open a guide page.
Expected: an "Edit" button appears bottom-right; clicking opens the editor; editing the body updates the iframe preview; Publish returns a status (commit fails locally without a real `GITHUB_TOKEN`, expected until Task 10).

- [ ] **Step 5: Commit**

```bash
git add src/components/AdminEditor.tsx src/components/AdminEditButton.astro src/pages/editorials src/pages/guides src/pages/tools src/pages/trials src/pages/templates src/pages/workflows src/pages/api/admin
git commit -m "feat(editor): editor island and conditional edit button"
```

---

## Task 9: Auto-deploy workflow

**Files:**
- Create: `.github/workflows/deploy-content.yml`
- Modify: `.github/workflows/daily-news-build.yml`

- [ ] **Step 1: Create `.github/workflows/deploy-content.yml`**

```yaml
name: Deploy on Content Change

on:
  push:
    branches: [main]
    paths:
      - 'src/content/**'

permissions:
  contents: read

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: node scripts/post-build.mjs
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --config dist/server/wrangler.json
```

- [ ] **Step 2: Fix the daily workflow to run post-build**

In `.github/workflows/daily-news-build.yml`, add `- run: node scripts/post-build.mjs` immediately after the `Build site` step and before the `Deploy to Cloudflare Workers` step.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-content.yml .github/workflows/daily-news-build.yml
git commit -m "ci(editor): auto-deploy on content push; run post-build in daily workflow"
```

---

## Task 10: Secrets, password helper, and end-to-end verification

**Files:**
- Create: `scripts/hash-password.mjs`

- [ ] **Step 1: Implement `scripts/hash-password.mjs`**

Must match `hashPassword` in `src/lib/admin-auth.ts`: 100,000 iterations, SHA-256, 16-byte salt, format `iterations:saltHex:hashHex`.

```js
// Usage: node scripts/hash-password.mjs "your password"
import { webcrypto as crypto } from 'node:crypto';

const password = process.argv[2];
if (!password) { console.error('Usage: node scripts/hash-password.mjs "password"'); process.exit(1); }

const ITER = 100_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, key, 256);
const hex = (b) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
console.log(`${ITER}:${hex(salt)}:${hex(bits)}`);
```

- [ ] **Step 2: Owner sets the secrets**

Owner runs (interactively; the `!` prefix works in-session):

```bash
node scripts/hash-password.mjs "CHOSEN_PASSWORD"   # copy the output
npx wrangler secret put ADMIN_PASSWORD_HASH        # paste the hash
npx wrangler secret put GITHUB_TOKEN               # fine-grained PAT, repo llmsfordoctors, Contents: read/write
npx wrangler secret put GITHUB_OWNER               # jasongusdorf
npx wrangler secret put GITHUB_REPO                # llmsfordoctors
```

Also paste the same hash and token into `.dev.vars` for local testing.

- [ ] **Step 3: Deploy**

Run: `npm run deploy`
Expected: deploy succeeds; bindings list includes `ADMIN_STORE`.

- [ ] **Step 4: End-to-end verification (production)**

1. Visit `https://llmsfordoctors.com/admin/login`, enter the password. Expected: redirect; cookie set.
2. Open a guide page. Expected: "Edit" button visible.
3. Edit a sentence, click Publish. Expected: "Publishing. Live in about a minute" with a commit link.
4. Confirm the commit in GitHub and that "Deploy on Content Change" runs and succeeds.
5. Reload the public page after the deploy. Expected: the edit is live.
6. Clear the cookie; confirm `/admin/edit/...` redirects to login and `POST /api/admin/save` returns 401.
7. Submit a wrong password 5 times. Expected: 429.
8. Try saving content containing an em dash. Expected: 400 with the em-dash error; no commit.

- [ ] **Step 5: Commit**

```bash
git add scripts/hash-password.mjs
git commit -m "chore(editor): password hashing helper"
```

---

## Self-review notes

- **Spec coverage:** auth (Tasks 2, 5), editor UI + sandboxed preview (Tasks 7, 8), save/commit (Tasks 3, 6), auto-deploy + post-build fix (Task 9), security (em-dash guard + required fields in Task 1; sessions + rate-limit in Task 2; CSRF header + slug allowlist + auth check in Task 6; sandboxed/sanitized preview in Task 8), KV wiring (Task 4), secrets/setup (Task 10), testing (Tasks 1-3 unit; Task 10 manual E2E). Every spec section maps to a task.
- **Out of scope, as specified:** create/delete articles, media upload, multi-user. Not in any task.
- **Type consistency:** `CollectionName` / `COLLECTIONS` / `isCollection` / `parseMdx` / `serializeMdx` / `validateContent` (Task 1) reused by the same names in Tasks 6, 7. `getFile` / `putFile` / `GithubConfig` (Task 3) reused in Tasks 6, 7. `isAuthed` / `SESSION_COOKIE` / `readCookie` / `clientIp` (Task 5) reused in Tasks 6, 7, 8. Session value `{ createdAt, expiresAt }` consistent across `createSession` / `validateSession`. Password format `iterations:salt:hash` identical in `admin-auth.ts` and `hash-password.mjs`.
- **Security note:** the preview sanitizes `marked` output with DOMPurify and renders it inside a script-disabled (`sandbox=""`) iframe, so even self-authored markdown cannot inject script into the app. Only the authenticated admin can reach the editor and only existing content files can be written (slug allowlist).
- **Known risk (flagged):** `serializeMdx` uses `yaml.stringify`, which may reformat frontmatter (key order, quoting) versus the original, producing a larger-than-expected diff on the first edit of a file. Acceptable for v1; a frontmatter-preserving serializer is the fix if diffs are noisy.
- **Known branch (Task 8):** detail pages may use `getStaticPaths` (static). Primary path converts to per-request rendering; Step 3a is the static-friendly client fallback via `/api/admin/whoami`.
```
