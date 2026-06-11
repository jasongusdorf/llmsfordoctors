import { describe, it, expect } from 'vitest';
import { templateFor } from './field-templates';
import { COLLECTIONS } from './mdx-file';

const REQUIRED: Record<string, string[]> = {
  editorials: ['title', 'description', 'tags', 'lastUpdated'],
  guides: ['title', 'description', 'tags', 'lastUpdated'],
  tools: ['title', 'slug', 'vendor', 'rating', 'verdict', 'pricing', 'hasBaa', 'categories', 'lastUpdated'],
  trials: ['title', 'journal', 'year', 'doi', 'keyFinding', 'lastUpdated', 'tags'],
  templates: ['title', 'category', 'targetTool', 'tags', 'lastUpdated'],
  workflows: ['title', 'category', 'tools', 'tags', 'timeToRead', 'lastUpdated'],
  videos: ['title', 'url', 'channel', 'summary', 'category', 'llm', 'topic', 'priority', 'dateAdded'],
};

describe('templateFor', () => {
  it('provides a template containing every required field for every collection', () => {
    for (const c of COLLECTIONS) {
      const t = templateFor(c);
      for (const field of REQUIRED[c]) {
        expect(Object.keys(t), `${c} missing ${field}`).toContain(field);
      }
    }
  });

  it('tools template follows the order and rating conventions', () => {
    const t = templateFor('tools');
    expect(t.rating).toBe(3);
    expect(typeof t.order).toBe('number');
  });

  it('dates default to today in YYYY-MM-DD', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(templateFor('guides').lastUpdated).toBe(today);
    expect(templateFor('videos').dateAdded).toBe(today);
  });
});
