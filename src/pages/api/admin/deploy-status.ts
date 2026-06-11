import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getDeployState, type GithubConfig } from '../../../lib/github-content';
import { isAuthed } from '../../../lib/admin-session';

export const prerender = false;

const SHA_RE = /^[0-9a-f]{7,40}$/;

export const GET: APIRoute = async ({ request, url }) => {
  if (!(await isAuthed(request.headers.get('Cookie')))) return json({ error: 'Unauthorized' }, 401);

  const sha = url.searchParams.get('sha') ?? '';
  if (!SHA_RE.test(sha)) return json({ error: 'Invalid sha' }, 400);

  const cfg: GithubConfig = {
    token: (env as any).GITHUB_TOKEN,
    owner: (env as any).GITHUB_OWNER ?? 'jasongusdorf',
    repo: (env as any).GITHUB_REPO ?? 'llmsfordoctors',
  };

  try {
    const state = await getDeployState(cfg, sha);
    return json({ state }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'GitHub error';
    return json({ error: msg }, 502);
  }
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
