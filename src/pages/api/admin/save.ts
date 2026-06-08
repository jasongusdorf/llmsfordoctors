import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isCollection, serializeMdx, validateContent, type CollectionName } from '../../../lib/mdx-file';
import { getFile, putFile, type GithubConfig } from '../../../lib/github-content';
import { isAuthed } from '../../../lib/admin-session';

export const prerender = false;

const SLUG_RE = /^[a-z0-9-]+$/;

async function commit(cfg: GithubConfig, path: string, text: string, sha: string | undefined, message: string) {
  try {
    const { commitUrl } = await putFile(cfg, path, text, sha, message);
    return json({ ok: true, commitUrl }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Commit failed';
    const conflict = msg.includes('409');
    return json({ error: conflict ? 'File changed since you loaded it; reload and retry' : msg }, conflict ? 409 : 500);
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('X-Requested-With') !== 'lfd-editor') return json({ error: 'Bad request' }, 400);
  if (!(await isAuthed(request.headers.get('Cookie')))) return json({ error: 'Unauthorized' }, 401);

  const parsed = (await request.json().catch(() => null)) as unknown;
  const payload = (parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}) as {
    collection?: string; slug?: string; frontmatter?: Record<string, unknown>; body?: string; create?: unknown;
  };
  const { collection, slug, frontmatter, body } = payload;
  const create = Boolean(payload.create);

  if (!collection || !isCollection(collection)) return json({ error: 'Unknown collection' }, 400);
  if (!slug || !SLUG_RE.test(slug)) return json({ error: 'Invalid slug' }, 400);
  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter) || typeof body !== 'string') {
    return json({ error: 'Missing or malformed content' }, 400);
  }

  const errors = validateContent(collection as CollectionName, frontmatter, body);
  if (errors.length) return json({ error: errors.join('; ') }, 400);

  const CREATABLE = ['guides', 'editorials'];
  if (create && !CREATABLE.includes(collection)) {
    return json({ error: 'New articles can only be guides or editorials' }, 400);
  }

  const cfg: GithubConfig = {
    token: (env as any).GITHUB_TOKEN,
    owner: (env as any).GITHUB_OWNER ?? 'jasongusdorf',
    repo: (env as any).GITHUB_REPO ?? 'llmsfordoctors',
  };
  const path = `src/content/${collection}/${slug}.mdx`;
  const text = serializeMdx(frontmatter, body);

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
    return commit(cfg, path, text, undefined, `content: create ${slug} via web editor`);
  }

  const existing = await loadExisting();
  if (existing instanceof Response) return existing;
  if (!existing) return json({ error: 'File not found; cannot create new files here' }, 404);
  return commit(cfg, path, text, existing.sha, `content: edit ${slug} via web editor`);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
