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
});
