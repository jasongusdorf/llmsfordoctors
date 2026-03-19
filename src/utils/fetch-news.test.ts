import { describe, it, expect } from 'vitest';
import {
  stripHtml,
  tokenize,
  jaccardSimilarity,
  deduplicate,
  scoreItem,
  aiRelevanceScore,
  type NewsItem,
} from './fetch-news.js';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(stripHtml('hello   world\n\tfoo')).toBe('hello world foo');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });
});

describe('tokenize', () => {
  it('lowercases and splits into words', () => {
    const tokens = tokenize('Hello World');
    expect(tokens).toEqual(new Set(['hello', 'world']));
  });

  it('strips punctuation', () => {
    const tokens = tokenize("AI's impact on medicine!");
    expect(tokens.has('ais')).toBe(true);
    expect(tokens.has('impact')).toBe(true);
    expect(tokens.has('medicine')).toBe(true);
  });

  it('filters words with 2 or fewer characters', () => {
    const tokens = tokenize('AI is a big deal');
    expect(tokens.has('is')).toBe(false);
    expect(tokens.has('a')).toBe(false);
    expect(tokens.has('big')).toBe(true);
    expect(tokens.has('deal')).toBe(true);
  });
});

describe('jaccardSimilarity', () => {
  it('returns 1.0 for identical sets', () => {
    const a = new Set(['hello', 'world']);
    expect(jaccardSimilarity(a, a)).toBe(1.0);
  });

  it('returns 0.0 for disjoint sets', () => {
    const a = new Set(['hello']);
    const b = new Set(['world']);
    expect(jaccardSimilarity(a, b)).toBe(0.0);
  });

  it('returns correct value for partial overlap', () => {
    const a = new Set(['hello', 'world', 'foo']);
    const b = new Set(['hello', 'world', 'bar']);
    // intersection: 2, union: 4 -> 0.5
    expect(jaccardSimilarity(a, b)).toBe(0.5);
  });

  it('returns 0.0 for two empty sets', () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0.0);
  });
});

describe('deduplicate', () => {
  const makeItem = (title: string, url: string): NewsItem => ({
    title,
    source: 'Test',
    url,
    date: new Date().toISOString(),
    summary: 'Test summary',
  });

  it('removes exact URL duplicates', () => {
    const items = [
      makeItem('Article One', 'https://example.com/1'),
      makeItem('Article Two', 'https://example.com/1'),
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Article One');
  });

  it('removes fuzzy title duplicates (Jaccard > 0.8)', () => {
    const items = [
      makeItem('AI transforms medicine in new study results', 'https://a.com/1'),
      makeItem('AI transforms medicine in new study results today', 'https://b.com/2'),
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(1);
  });

  it('keeps distinct articles', () => {
    const items = [
      makeItem('AI in radiology improves diagnosis', 'https://a.com/1'),
      makeItem('New cancer treatment shows promise', 'https://b.com/2'),
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(2);
  });
});

describe('aiRelevanceScore', () => {
  it('scores AI-related articles higher', () => {
    const aiArticle: NewsItem = {
      title: 'Machine learning improves clinical diagnosis',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'A new artificial intelligence model helps doctors',
    };
    const genericArticle: NewsItem = {
      title: 'New drug approved for diabetes',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'The FDA approved a new treatment option',
    };
    expect(aiRelevanceScore(aiArticle)).toBeGreaterThan(aiRelevanceScore(genericArticle));
  });

  it('returns 0 for articles with no AI keywords', () => {
    const item: NewsItem = {
      title: 'Flu season peaks in February',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'Hospitals report higher admissions',
    };
    expect(aiRelevanceScore(item)).toBe(0);
  });
});

describe('scoreItem', () => {
  it('scores recent high-priority items higher', () => {
    const recent: NewsItem = {
      title: 'Test',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'Test',
    };
    const highPriority = scoreItem(recent, 1, false);
    const lowPriority = scoreItem(recent, 4, false);
    expect(highPriority).toBeGreaterThan(lowPriority);
  });

  it('scores newer items higher than older ones at same priority', () => {
    const now: NewsItem = {
      title: 'Test',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'Test',
    };
    const twoDaysAgo: NewsItem = {
      ...now,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
    expect(scoreItem(now, 2, false)).toBeGreaterThan(scoreItem(twoDaysAgo, 2, false));
  });

  it('gives aiOnly sources a relevance boost', () => {
    const item: NewsItem = {
      title: 'Generic article title',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'No AI keywords here',
    };
    const withAiOnly = scoreItem(item, 2, true);
    const withoutAiOnly = scoreItem(item, 2, false);
    expect(withAiOnly).toBeGreaterThan(withoutAiOnly);
  });
});
