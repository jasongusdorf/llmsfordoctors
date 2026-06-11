import { describe, it, expect } from 'vitest';
import { fieldKindFor, TOOL_CATEGORIES, VIDEO_CATEGORIES, WORKFLOW_CATEGORIES } from './field-config';

describe('fieldKindFor', () => {
  it('tools rating is a star picker 0-5', () => {
    expect(fieldKindFor('tools', 'rating')).toEqual({ kind: 'stars', min: 0, max: 5 });
  });

  it('tools categories are enum chips', () => {
    expect(fieldKindFor('tools', 'categories')).toEqual({ kind: 'chips-enum', options: TOOL_CATEGORIES });
  });

  it('workflow and video category are single selects', () => {
    expect(fieldKindFor('workflows', 'category')).toEqual({ kind: 'select', options: WORKFLOW_CATEGORIES });
    expect(fieldKindFor('videos', 'category')).toEqual({ kind: 'select', options: VIDEO_CATEGORIES });
  });

  it('tags are free chips and socialPost is a textarea in every collection', () => {
    expect(fieldKindFor('guides', 'tags')).toEqual({ kind: 'chips' });
    expect(fieldKindFor('tools', 'socialPost')).toEqual({ kind: 'textarea' });
    expect(fieldKindFor('trials', 'keyFinding')).toEqual({ kind: 'textarea' });
  });

  it('dates and numbers map to their inputs', () => {
    expect(fieldKindFor('guides', 'lastUpdated')).toEqual({ kind: 'date' });
    expect(fieldKindFor('videos', 'dateAdded')).toEqual({ kind: 'date' });
    expect(fieldKindFor('videos', 'priority')).toEqual({ kind: 'number', min: 1, max: 5 });
    expect(fieldKindFor('tools', 'order')).toMatchObject({ kind: 'number' });
  });

  it('slug is readonly and unknown fields return undefined', () => {
    expect(fieldKindFor('tools', 'slug')).toEqual({ kind: 'readonly' });
    expect(fieldKindFor('guides', 'someUnknownField')).toBeUndefined();
  });
});
