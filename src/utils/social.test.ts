import { describe, it, expect } from 'vitest';
import { buildOAuthHeader, selectContent, pickCollection, filterEligible, buildTweetText, shouldResetCollection, resetCollectionFromLog } from './social';
import type { ContentItem, PostedEntry } from './social';

describe('buildOAuthHeader', () => {
  it('produces a valid Authorization header string', async () => {
    const header = await buildOAuthHeader({
      method: 'POST',
      url: 'https://api.x.com/2/tweets',
      apiKey: 'testkey',
      apiSecret: 'testsecret',
      accessToken: 'testtoken',
      accessSecret: 'testtokensecret',
      body: '{"text":"hello"}',
    });
    expect(header).toMatch(/^OAuth /);
    expect(header).toContain('oauth_consumer_key="testkey"');
    expect(header).toContain('oauth_token="testtoken"');
    expect(header).toContain('oauth_signature_method="HMAC-SHA1"');
    expect(header).toContain('oauth_signature=');
    expect(header).toContain('oauth_nonce=');
    expect(header).toContain('oauth_timestamp=');
    expect(header).toContain('oauth_version="1.0"');
  });

  it('produces different signatures for different bodies', async () => {
    const params = {
      method: 'POST' as const,
      url: 'https://api.x.com/2/tweets',
      apiKey: 'testkey',
      apiSecret: 'testsecret',
      accessToken: 'testtoken',
      accessSecret: 'testtokensecret',
    };
    const h1 = await buildOAuthHeader({ ...params, body: '{"text":"hello"}' });
    const h2 = await buildOAuthHeader({ ...params, body: '{"text":"world"}' });
    expect(h1).not.toEqual(h2);
  });
});

describe('pickCollection', () => {
  it('returns trials for random value 0', () => {
    expect(pickCollection(0)).toBe('trials');
  });
  it('returns trials for random value 0.34', () => {
    expect(pickCollection(0.34)).toBe('trials');
  });
  it('returns tools for random value 0.35', () => {
    expect(pickCollection(0.35)).toBe('tools');
  });
  it('returns videos for random value 0.99', () => {
    expect(pickCollection(0.99)).toBe('videos');
  });
});

const makeContentItem = (overrides: Partial<ContentItem> = {}): ContentItem => ({
  id: 'test-item',
  collection: 'trials',
  socialPost: 'A test social post.',
  url: '/trials/test-item',
  ...overrides,
});

describe('filterEligible', () => {
  it('returns items with socialPost that have not been posted', () => {
    const items = [
      makeContentItem({ id: 'a', collection: 'trials' }),
      makeContentItem({ id: 'b', collection: 'trials' }),
    ];
    const log: PostedEntry[] = [{ slug: 'a', collection: 'trials', postedAt: '2026-03-01T00:00:00Z' }];
    const result = filterEligible(items, 'trials', log);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('excludes items without socialPost', () => {
    const items = [
      makeContentItem({ id: 'a', socialPost: '' }),
      makeContentItem({ id: 'b', socialPost: 'Has copy.' }),
    ];
    const result = filterEligible(items, 'trials', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('only considers items from the specified collection', () => {
    const items = [
      makeContentItem({ id: 'a', collection: 'trials' }),
      makeContentItem({ id: 'b', collection: 'tools' }),
    ];
    const result = filterEligible(items, 'trials', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });
});

describe('selectContent', () => {
  it('returns null when no items have socialPost', () => {
    const items = [makeContentItem({ socialPost: '' })];
    expect(selectContent(items, [])).toBeNull();
  });

  it('returns an item when eligible items exist', () => {
    const items = [
      makeContentItem({ id: 'a', collection: 'trials' }),
      makeContentItem({ id: 'b', collection: 'tools' }),
      makeContentItem({ id: 'c', collection: 'editorials' }),
      makeContentItem({ id: 'd', collection: 'guides' }),
      makeContentItem({ id: 'e', collection: 'workflows' }),
      makeContentItem({ id: 'f', collection: 'templates' }),
      makeContentItem({ id: 'g', collection: 'videos' }),
    ];
    const result = selectContent(items, []);
    expect(result).not.toBeNull();
  });
});

describe('buildTweetText', () => {
  it('combines socialPost with full URL', () => {
    const item = makeContentItem({ id: 'gpt4-gastro', collection: 'trials', socialPost: 'GPT-4 matched gastroenterologists on DDx.' });
    const text = buildTweetText(item, 'https://llmsfordoctors.com');
    expect(text).toBe('GPT-4 matched gastroenterologists on DDx. https://llmsfordoctors.com/trials/gpt4-gastro');
  });
});

describe('shouldResetCollection', () => {
  it('returns true when all eligible items have been posted', () => {
    const items = [
      makeContentItem({ id: 'a', collection: 'trials' }),
      makeContentItem({ id: 'b', collection: 'trials' }),
    ];
    const log: PostedEntry[] = [
      { slug: 'a', collection: 'trials', postedAt: '2026-03-01T00:00:00Z' },
      { slug: 'b', collection: 'trials', postedAt: '2026-03-02T00:00:00Z' },
    ];
    expect(shouldResetCollection(items, 'trials', log)).toBe(true);
  });

  it('returns false when some items remain unposted', () => {
    const items = [
      makeContentItem({ id: 'a', collection: 'trials' }),
      makeContentItem({ id: 'b', collection: 'trials' }),
    ];
    const log: PostedEntry[] = [
      { slug: 'a', collection: 'trials', postedAt: '2026-03-01T00:00:00Z' },
    ];
    expect(shouldResetCollection(items, 'trials', log)).toBe(false);
  });
});

describe('resetCollectionFromLog', () => {
  it('removes only entries for the specified collection', () => {
    const log: PostedEntry[] = [
      { slug: 'a', collection: 'trials', postedAt: '2026-03-01T00:00:00Z' },
      { slug: 'b', collection: 'tools', postedAt: '2026-03-02T00:00:00Z' },
    ];
    const result = resetCollectionFromLog(log, 'trials');
    expect(result).toHaveLength(1);
    expect(result[0].collection).toBe('tools');
  });
});
