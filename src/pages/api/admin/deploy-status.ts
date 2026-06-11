import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  decideDeployState, listContentDeployRuns, dispatchContentDeploy, getCommitDate,
  type GithubConfig,
} from '../../../lib/github-content';
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
    const [runs, commitDate] = await Promise.all([
      listContentDeployRuns(cfg),
      getCommitDate(cfg, sha),
    ]);
    const decision = decideDeployState(runs, sha, commitDate, new Date());
    if (decision !== 'dispatch') return json({ state: decision }, 200);

    // GitHub never created a run for this push; start one ourselves. The next
    // poll will see the dispatched run (created after the commit) as building.
    const dispatched = await dispatchContentDeploy(cfg);
    return json({ state: dispatched ? 'building' : 'pending', dispatched }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'GitHub error';
    return json({ error: msg }, 502);
  }
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
