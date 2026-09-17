import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import commons from './cardiology-open-media.json';
import minnesota from './cardiology-minnesota-media.json';
import cine from './cardiology-cine-media.json';

const root = fileURLToPath(new URL('../../', import.meta.url));
const media = [...commons, ...minnesota, ...cine];

describe('cardiology open media archive', () => {
  it('contains a substantial multi-source collection', () => {
    expect(media.length).toBeGreaterThanOrEqual(140);
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
    for (const item of media) {
      expect(existsSync(`${root}public${item.src}`), item.src).toBe(true);
      if ('poster' in item) expect(existsSync(`${root}public${item.poster}`), item.poster).toBe(true);
    }
  });

  it('contains a substantial echo and CMR cine collection', () => {
    expect(cine.length).toBeGreaterThanOrEqual(65);
    expect(new Set(cine.map((item) => item.modality))).toEqual(new Set(['Echo', 'Cardiac MRI']));
    expect(cine.every((item) => item.mime === 'video/mp4' && item.mediaKind === 'video')).toBe(true);
  });
});
