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

  it('rejects a socialPost longer than 256 chars', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: ['x'], lastUpdated: '2026-06-03',
      socialPost: 'x'.repeat(257),
    }, 'Body');
    expect(errors.some(e => e.includes('256'))).toBe(true);
  });

  it('flags an empty required array', () => {
    const errors = validateContent('guides', {
      title: 'T', description: 'D', tags: [], lastUpdated: '2026-06-03',
    }, 'Body');
    expect(errors.some(e => e.includes('tags'))).toBe(true);
  });
});
