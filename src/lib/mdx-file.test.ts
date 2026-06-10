import { describe, it, expect } from 'vitest';
import { parseMdx, serializeMdx, validateContent } from './mdx-file';

const SAMPLE = `---
title: "Hello"
description: "A test"
tags: [a, b]
lastUpdated: 2026-06-03
featured: false
---

Body line one.

Body line two.
`;

describe('parseMdx', () => {
  it('splits frontmatter and body', () => {
    const { frontmatter, body } = parseMdx(SAMPLE);
    expect(frontmatter.title).toBe('Hello');
    expect(frontmatter.tags).toEqual(['a', 'b']);
    expect(body.trim().startsWith('Body line one.')).toBe(true);
  });

  it('throws on a file with no frontmatter block', () => {
    expect(() => parseMdx('no frontmatter here')).toThrow();
  });
});

describe('serializeMdx', () => {
  it('round-trips parse then serialize to equivalent content', () => {
    const { frontmatter, body } = parseMdx(SAMPLE);
    const out = parseMdx(serializeMdx(frontmatter, body));
    expect(out.frontmatter.title).toBe('Hello');
    expect(out.body.trim()).toBe('Body line one.\n\nBody line two.');
    expect(out.frontmatter.tags).toEqual(['a', 'b']);
    expect(out.frontmatter.featured).toBe(false);
  });

  it('produces a leading and trailing frontmatter fence', () => {
    const text = serializeMdx({ title: 'X' }, 'Body');
    expect(text.startsWith('---\n')).toBe(true);
    expect(text).toContain('\n---\n');
  });
});

describe('validateContent', () => {
  it('passes a valid guide', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
    }, 'Body');
    expect(errors).toEqual([]);
  });

  it('flags a missing required field', () => {
    const errors = validateContent('guides', { title: 'T' }, 'Body');
    expect(errors.some(e => e.includes('description'))).toBe(true);
  });

  it('rejects an em dash in the body', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
    }, 'A sentence \u2014 with an em dash.');
    expect(errors.some(e => e.toLowerCase().includes('em dash'))).toBe(true);
  });

  it('does not limit socialPost length (the tweet builder truncates instead)', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
      socialPost: 'x'.repeat(400),
    }, 'Body');
    expect(errors).toEqual([]);
  });

  it('flags an empty required array', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: [], lastUpdated: '2026-06-03',
    }, 'Body');
    expect(errors.some(e => e.includes('tags'))).toBe(true);
  });
});

describe('tools file round-trip', () => {
  const TOOL_SAMPLE = `---
title: "Claude for Clinical Practice"
slug: claude
vendor: Anthropic
rating: 5
order: 10
verdict: "Best-in-class"
pricing: "Free tier + $20/mo Pro"
hasBaa: true
categories: [note-writing, general]
lastUpdated: 2026-03-18
---

Body text.
`;

  it('preserves lastUpdated through parse and serialize', () => {
    const { frontmatter, body } = parseMdx(TOOL_SAMPLE);
    // Pins the core-schema behavior: a switch to a Date-producing YAML schema
    // would corrupt lastUpdated on re-serialize.
    expect(typeof frontmatter.lastUpdated).toBe('string');
    const out = serializeMdx(frontmatter, body);
    expect(out).toMatch(/^lastUpdated: 2026-03-18$/m);
    const again = parseMdx(out);
    expect(again.frontmatter.rating).toBe(5);
    expect(again.frontmatter.order).toBe(10);
    expect(again.frontmatter.hasBaa).toBe(true);
    expect(again.frontmatter.categories).toEqual(['note-writing', 'general']);
  });
});

describe('validateContent, tools guardrails', () => {
  const toolFm = (over: Record<string, unknown> = {}) => ({
    title: 'T',
    slug: 't',
    vendor: 'V',
    rating: 4,
    verdict: 'v',
    pricing: 'Free',
    hasBaa: true,
    categories: ['general'],
    lastUpdated: '2026-06-10',
    ...over,
  });

  it('accepts a valid tool with an order field', () => {
    expect(validateContent('tools', toolFm({ order: 30 }), 'Body')).toEqual([]);
  });

  it('accepts a valid tool without an order field', () => {
    expect(validateContent('tools', toolFm(), 'Body')).toEqual([]);
  });

  it('rejects a rating above 5', () => {
    expect(validateContent('tools', toolFm({ rating: 7 }), 'Body').join(' ')).toMatch(/rating/);
  });

  it('rejects a negative rating', () => {
    expect(validateContent('tools', toolFm({ rating: -1 }), 'Body').join(' ')).toMatch(/rating/);
  });

  it('rejects a non-numeric rating', () => {
    expect(validateContent('tools', toolFm({ rating: '4' }), 'Body').join(' ')).toMatch(/rating/);
  });

  it('rejects a non-numeric order', () => {
    expect(validateContent('tools', toolFm({ order: 'first' }), 'Body').join(' ')).toMatch(/order/);
  });
});
