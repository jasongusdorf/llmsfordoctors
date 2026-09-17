import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cardiologyCases, type CaseMode } from './cardiology-cases';

describe('cardiology cases', () => {
  it('contains the complete 50-case curriculum', () => {
    expect(cardiologyCases).toHaveLength(50);
  });
  it('uses unique IDs and valid answer indices', () => {
    expect(new Set(cardiologyCases.map((item) => item.id)).size).toBe(cardiologyCases.length);
    for (const item of cardiologyCases) {
      expect(item.stages.length).toBeGreaterThan(0);
      expect(item.guidelineLinks.length).toBeGreaterThan(0);
      expect(item.textbookReferences.length).toBeGreaterThan(0);
      for (const stage of item.stages) {
        expect(stage.answer).toBeGreaterThanOrEqual(0);
        expect(stage.answer).toBeLessThan(stage.options.length);
        if (stage.media) expect(stage.media.src.startsWith('/')).toBe(true);
      }
    }
  });

  it('gives every case content in all three modes', () => {
    const modes: CaseMode[] = ['board', 'bedside', 'rapid'];
    for (const item of cardiologyCases) {
      for (const mode of modes) {
        expect(item.stages.some((stage) => !stage.modes || stage.modes.includes(mode)), `${item.id} lacks ${mode}`).toBe(true);
      }
    }
  });

  it('incorporates licensed cine loops into exact-match cases', () => {
    const videoStages = cardiologyCases.flatMap((item) => item.stages.filter((stage) => stage.media?.type === 'video'));
    expect(videoStages).toHaveLength(22);
    for (const stage of videoStages) {
      if (stage.media?.type !== 'video') continue;
      expect(existsSync(resolve(`public${stage.media.src}`)), stage.media.src).toBe(true);
      expect(existsSync(resolve(`public${stage.media.poster}`)), stage.media.poster).toBe(true);
      expect(stage.media.href).toMatch(/^https:\/\//);
      expect(stage.media.licenseUrl).toMatch(/^https:\/\//);
      expect(stage.media.credit.length).toBeGreaterThan(5);
    }
  });
});
