import { describe, it, expect } from 'vitest';
import {
  tokenize,
  jaccardSimilarity,
  deduplicate,
  aiRelevanceScore,
  scoreItem,
} from './refresh-news';
import type { NewsItem } from './types';

const makeItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  title: 'Test Article',
  source: 'Test Source',
  url: 'https://example.com/test',
  date: new Date().toISOString(),
  summary: 'A test summary',
  ...overrides,
});

describe('tokenize', () => {
  it('lowercases and splits into words > 2 chars', () => {
    const tokens = tokenize('AI in Medicine Today');
    expect(tokens).toEqual(new Set(['medicine', 'today']));
  });
  it('strips punctuation', () => {
    const tokens = tokenize("It's a test!");
    expect(tokens).toEqual(new Set(['its', 'test']));
  });
});

describe('jaccardSimilarity', () => {
  it('returns 1 for identical sets', () => {
    const s = new Set(['a', 'b']);
    expect(jaccardSimilarity(s, s)).toBe(1);
  });
  it('returns 0 for disjoint sets', () => {
    expect(jaccardSimilarity(new Set(['a']), new Set(['b']))).toBe(0);
  });
  it('returns 0 for two empty sets', () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0);
  });
});

describe('deduplicate', () => {
  it('removes exact URL duplicates', () => {
    const items = [
      makeItem({ url: 'https://example.com/1', title: 'Article A' }),
      makeItem({ url: 'https://example.com/1', title: 'Article A Copy' }),
    ];
    expect(deduplicate(items)).toHaveLength(1);
  });
  it('removes fuzzy title duplicates (Jaccard > 0.8)', () => {
    const items = [
      makeItem({ url: 'https://a.com/1', title: 'AI Transforms Clinical Decision Making in Emergency Medicine' }),
      makeItem({ url: 'https://b.com/2', title: 'AI Transforms Clinical Decision Making in Emergency Medicine Today' }),
    ];
    expect(deduplicate(items)).toHaveLength(1);
  });
  it('keeps dissimilar items', () => {
    const items = [
      makeItem({ url: 'https://a.com/1', title: 'AI in Radiology' }),
      makeItem({ url: 'https://b.com/2', title: 'New Drug for Diabetes' }),
    ];
    expect(deduplicate(items)).toHaveLength(2);
  });
});

describe('aiRelevanceScore', () => {
  it('scores higher for AI-related content', () => {
    const aiItem = makeItem({ title: 'Large language model clinical decision support' });
    const genericItem = makeItem({ title: 'Hospital cafeteria renovations complete' });
    expect(aiRelevanceScore(aiItem)).toBeGreaterThan(aiRelevanceScore(genericItem));
  });
  it('returns 0 for completely irrelevant content', () => {
    expect(aiRelevanceScore(makeItem({ title: 'Weather forecast', summary: 'Sunny today' }))).toBe(0);
  });
});

describe('scoreItem', () => {
  it('scores recent items higher than old items', () => {
    const recent = makeItem({ date: new Date().toISOString() });
    const old = makeItem({ date: new Date('2025-01-01').toISOString() });
    expect(scoreItem(recent, 1, true)).toBeGreaterThan(scoreItem(old, 1, true));
  });
  it('gives journal bonus to priority-0 items', () => {
    const item = makeItem();
    const withBonus = scoreItem(item, 0, true);
    const withoutBonus = scoreItem(item, 1, true);
    expect(withBonus - withoutBonus).toBeGreaterThanOrEqual(15);
  });
  it('gives automatic relevance to aiOnly sources', () => {
    const item = makeItem({ title: 'Hospital cafeteria renovations', summary: 'No AI here' });
    expect(scoreItem(item, 1, true)).toBeGreaterThan(scoreItem(item, 1, false));
  });
});
