import { describe, expect, it } from 'vitest';
import { isDue, nextInterval, overallAccuracy, topErrorTags, updateCaseProgress } from './cardiology-case-progress';

describe('case lab spaced repetition', () => {
  it('repeats misses tomorrow and expands strong recalls', () => {
    expect(nextInterval(7, 0.5)).toBe(1);
    expect(nextInterval(1, 1)).toBe(3);
    expect(nextInterval(7, 1)).toBe(14);
  });

  it('tracks calibration and error patterns', () => {
    const now = new Date('2026-09-17T12:00:00Z');
    const row = updateCaseProgress(undefined, {
      correctAnswers: 1,
      totalAnswers: 2,
      confidence: 'high',
      errorTags: ['reperfusion'],
    }, now);
    expect(row.overconfidentErrors).toBe(1);
    expect(row.errorTags.reperfusion).toBe(1);
    expect(isDue(row, now)).toBe(false);
  });

  it('summarizes accuracy and recurring misses', () => {
    const row = updateCaseProgress(undefined, {
      correctAnswers: 2,
      totalAnswers: 3,
      confidence: 'medium',
      errorTags: ['rhythm', 'rhythm'],
    });
    const progress = { version: 1 as const, cases: { one: row } };
    expect(overallAccuracy(progress)).toBeCloseTo(2 / 3);
    expect(topErrorTags(progress)).toEqual([['rhythm', 2]]);
  });
});
