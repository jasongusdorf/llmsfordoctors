import { describe, it, expect, vi } from 'vitest';
import {
  getFile, putFile, decideDeployState, listContentDeployRuns, dispatchContentDeploy, getCommitDate,
  type WorkflowRun,
} from './github-content';

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

  it('requests ref=main with an auth header', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ content: btoa('x'), sha: 's' }), { status: 200 }));
    await getFile(cfg, 'src/content/guides/x.mdx', fetchMock as any);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('?ref=main');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer t');
  });

  it('throws on a non-404 error status', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 500 }));
    await expect(getFile(cfg, 'src/content/guides/x.mdx', fetchMock as any)).rejects.toThrow();
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

  it('encodes multibyte UTF-8 content losslessly', async () => {
    const content = 'café \u2014 naïve 🩺 日本語';
    let sentB64 = '';
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      sentB64 = JSON.parse(init.body as string).content;
      return new Response(JSON.stringify({ commit: { html_url: 'https://github.com/commit/2' } }), { status: 200 });
    });
    await putFile(cfg, 'src/content/guides/x.mdx', content, 'sha', 'msg', fetchMock as any);
    const bytes = Uint8Array.from(atob(sentB64), c => c.charCodeAt(0));
    expect(new TextDecoder().decode(bytes)).toBe(content);
  });

  it('omits sha from the body when creating a new file', async () => {
    let sent: any = null;
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      sent = JSON.parse(init.body as string);
      return new Response(JSON.stringify({ commit: { html_url: 'https://github.com/commit/3' } }), { status: 200 });
    });
    await putFile(cfg, 'src/content/guides/new.mdx', 'body', undefined, 'msg', fetchMock as any);
    expect('sha' in sent).toBe(false);
    expect(sent.branch).toBe('main');
  });

  it('includes sha when updating', async () => {
    let sent: any = null;
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      sent = JSON.parse(init.body as string);
      return new Response(JSON.stringify({ commit: { html_url: 'https://github.com/commit/4' } }), { status: 200 });
    });
    await putFile(cfg, 'src/content/guides/x.mdx', 'body', 'abc123', 'msg', fetchMock as any);
    expect(sent.sha).toBe('abc123');
  });

  it('returns the commit sha alongside the url', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ commit: { html_url: 'https://github.com/commit/5', sha: 'deadbeef' } }), { status: 200 },
    ));
    const out = await putFile(cfg, 'src/content/guides/x.mdx', 'b', 'abc', 'msg', fetchMock as any);
    expect(out.commitSha).toBe('deadbeef');
  });
});

describe('decideDeployState', () => {
  const SHA = 'a'.repeat(40);
  const OTHER = 'b'.repeat(40);
  const committed = '2026-06-11T14:24:43Z';
  const run = (over: Partial<WorkflowRun>): WorkflowRun => ({
    head_sha: SHA, status: 'completed', conclusion: 'success', created_at: '2026-06-11T14:25:00Z', ...over,
  });
  const soonAfter = new Date('2026-06-11T14:25:00Z');   // 17s after commit
  const wellAfter = new Date('2026-06-11T14:26:00Z');   // 77s after commit

  it('uses the run for our sha when one exists', () => {
    expect(decideDeployState([run({})], SHA, committed, soonAfter)).toBe('success');
    expect(decideDeployState([run({ status: 'in_progress', conclusion: null })], SHA, committed, soonAfter)).toBe('building');
    expect(decideDeployState([run({ conclusion: 'failure' })], SHA, committed, soonAfter)).toBe('failure');
  });

  it('treats a later run on another commit as covering ours', () => {
    // Linear history: a run created after our commit deploys a descendant.
    expect(decideDeployState([run({ head_sha: OTHER })], SHA, committed, wellAfter)).toBe('success');
    expect(decideDeployState([run({ head_sha: OTHER, status: 'queued', conclusion: null })], SHA, committed, wellAfter)).toBe('building');
  });

  it('ignores runs created before our commit', () => {
    const stale = run({ head_sha: OTHER, created_at: '2026-06-11T14:24:00Z' });
    expect(decideDeployState([stale], SHA, committed, wellAfter)).toBe('dispatch');
  });

  it('reports failure when the only later run failed, instead of re-dispatching', () => {
    const failed = run({ head_sha: OTHER, conclusion: 'failure' });
    expect(decideDeployState([failed], SHA, committed, wellAfter)).toBe('failure');
  });

  it('waits patiently right after the commit, then asks for a dispatch', () => {
    expect(decideDeployState([], SHA, committed, soonAfter)).toBe('pending');
    expect(decideDeployState([], SHA, committed, wellAfter)).toBe('dispatch');
  });
});

describe('GitHub Actions helpers', () => {
  it('listContentDeployRuns queries the content workflow by filename', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      workflow_runs: [{ head_sha: 'x'.repeat(40), status: 'completed', conclusion: 'success', created_at: '2026-06-11T00:00:00Z' }],
    }), { status: 200 }));
    const runs = await listContentDeployRuns(cfg, fetchMock as any);
    expect(runs).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0] as string).toContain('/actions/workflows/deploy-content.yml/runs');
  });

  it('listContentDeployRuns throws on an error status', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 500 }));
    await expect(listContentDeployRuns(cfg, fetchMock as any)).rejects.toThrow();
  });

  it('dispatchContentDeploy POSTs a dispatch on main and reports success', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    expect(await dispatchContentDeploy(cfg, fetchMock as any)).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/actions/workflows/deploy-content.yml/dispatches');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ ref: 'main' });
  });

  it('dispatchContentDeploy reports false when the token cannot dispatch', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 403 }));
    expect(await dispatchContentDeploy(cfg, fetchMock as any)).toBe(false);
  });

  it('getCommitDate returns the committer date', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      commit: { committer: { date: '2026-06-11T14:24:43Z' } },
    }), { status: 200 }));
    expect(await getCommitDate(cfg, 'a'.repeat(40), fetchMock as any)).toBe('2026-06-11T14:24:43Z');
    expect(fetchMock.mock.calls[0][0] as string).toContain('/commits/');
  });
});
