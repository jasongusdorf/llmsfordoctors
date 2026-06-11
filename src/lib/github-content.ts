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
  cfg: GithubConfig, path: string, text: string, sha: string | undefined, message: string, fetchFn: typeof fetch = fetch,
): Promise<{ commitUrl: string; commitSha: string }> {
  const res = await fetchFn(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(cfg.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: textToB64(text), branch: 'main', ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw new Error(`GitHub putFile failed: ${res.status}`);
  const json = await res.json() as { commit: { html_url: string; sha: string } };
  return { commitUrl: json.commit.html_url, commitSha: json.commit.sha };
}

export type DeployState = 'pending' | 'building' | 'success' | 'failure';
export type DeployDecision = DeployState | 'dispatch';

export interface WorkflowRun {
  head_sha: string;
  status: string;            // queued | in_progress | completed
  conclusion: string | null; // success | failure | ... (null until completed)
  created_at: string;        // ISO 8601 Z
}

const CONTENT_WORKFLOW = 'deploy-content.yml';
// GitHub occasionally creates no run for a push that lands seconds after the
// previous one; give Actions this long before concluding the run is missing.
const DISPATCH_AFTER_MS = 45_000;

// Decides what a deploy poll should report. A run for our exact sha wins.
// Otherwise, because this repo's main history is linear (all editor pushes
// are fast-forward), any run created after our commit deploys a descendant
// that contains it. If no such run appears, ask the caller to dispatch one.
export function decideDeployState(
  runs: WorkflowRun[], sha: string, commitDate: string, now: Date,
): DeployDecision {
  const mine = runs.filter((r) => r.head_sha === sha);
  if (mine.length > 0) {
    if (mine.some((r) => r.status !== 'completed')) return 'building';
    return mine.every((r) => r.conclusion === 'success') ? 'success' : 'failure';
  }
  const later = runs.filter((r) => r.created_at > commitDate);
  if (later.some((r) => r.status !== 'completed')) return 'building';
  if (later.some((r) => r.conclusion === 'success')) return 'success';
  if (later.some((r) => r.conclusion !== null)) return 'failure';
  const age = now.getTime() - new Date(commitDate).getTime();
  return age > DISPATCH_AFTER_MS ? 'dispatch' : 'pending';
}

export async function listContentDeployRuns(
  cfg: GithubConfig, fetchFn: typeof fetch = fetch,
): Promise<WorkflowRun[]> {
  const res = await fetchFn(
    `${API}/repos/${cfg.owner}/${cfg.repo}/actions/workflows/${CONTENT_WORKFLOW}/runs?per_page=20`,
    { headers: headers(cfg.token) },
  );
  if (!res.ok) throw new Error(`GitHub listContentDeployRuns failed: ${res.status}`);
  const json = await res.json() as { workflow_runs: WorkflowRun[] };
  return json.workflow_runs.map(({ head_sha, status, conclusion, created_at }) => ({ head_sha, status, conclusion, created_at }));
}

export async function dispatchContentDeploy(
  cfg: GithubConfig, fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  const res = await fetchFn(
    `${API}/repos/${cfg.owner}/${cfg.repo}/actions/workflows/${CONTENT_WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: { ...headers(cfg.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'main' }),
    },
  );
  return res.ok;
}

export async function getCommitDate(
  cfg: GithubConfig, sha: string, fetchFn: typeof fetch = fetch,
): Promise<string> {
  const res = await fetchFn(`${API}/repos/${cfg.owner}/${cfg.repo}/commits/${sha}`, { headers: headers(cfg.token) });
  if (!res.ok) throw new Error(`GitHub getCommitDate failed: ${res.status}`);
  const json = await res.json() as { commit: { committer: { date: string } } };
  return json.commit.committer.date;
}
