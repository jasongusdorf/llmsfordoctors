import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import commons from './cardiology-open-media.json';
import minnesota from './cardiology-minnesota-media.json';

const root = fileURLToPath(new URL('../../', import.meta.url));
const media = [...commons, ...minnesota];

describe('cardiology open media archive', () => {
  it('contains a substantial multi-source collection', () => {
    expect(media.length).toBeGreaterThanOrEqual(75);
    expect(new Set(media.map((item) => new URL(item.sourcePage).hostname)).size).toBeGreaterThanOrEqual(2);
  });

  it('keeps complete provenance for every asset', () => {
    for (const item of media) {
      expect(item.creator).toBeTruthy();
      expect(item.license).toBeTruthy();
      expect(item.licenseUrl).toMatch(/^https?:\/\//);
      expect(item.sourcePage).toMatch(/^https?:\/\//);
      expect(item.localSha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('references files that exist in the public tree', () => {
    for (const item of media) expect(existsSync(`${root}public${item.src}`), item.src).toBe(true);
  });
});

