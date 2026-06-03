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
