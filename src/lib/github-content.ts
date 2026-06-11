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

// State of the GitHub Actions runs triggered by a commit. 'pending' means no
// run has been created yet (Actions can lag a few seconds behind the push).
export async function getDeployState(
  cfg: GithubConfig, sha: string, fetchFn: typeof fetch = fetch,
): Promise<DeployState> {
  const res = await fetchFn(
    `${API}/repos/${cfg.owner}/${cfg.repo}/actions/runs?head_sha=${sha}&per_page=10`,
    { headers: headers(cfg.token) },
  );
  if (!res.ok) throw new Error(`GitHub getDeployState failed: ${res.status}`);
  const json = await res.json() as { workflow_runs: Array<{ status: string; conclusion: string | null }> };
  const runs = json.workflow_runs;
  if (runs.length === 0) return 'pending';
  if (runs.some((r) => r.status !== 'completed')) return 'building';
  return runs.every((r) => r.conclusion === 'success') ? 'success' : 'failure';
}
