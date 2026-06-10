import { describe, it, expect } from 'vitest';
import { compareTools, type SortableTool } from './tool-sort';

function tool(name: string, rating: number, order?: number, pricing = 'Free'): SortableTool {
  return { name, rating, pricing, order };
}

describe('compareTools, rating sort (default)', () => {
  it('sorts by rating descending', () => {
    const sorted = [tool('A', 3), tool('B', 5)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });

  it('breaks rating ties by order ascending', () => {
    const sorted = [tool('A', 4, 50), tool('B', 4, 30)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });

  it('sorts tools without an order after tools with one, within the same rating', () => {
    const sorted = [tool('A', 4), tool('B', 4, 90)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });

  it('falls back to name when rating and order are equal', () => {
    const sorted = [tool('Zed', 4, 10), tool('Abe', 4, 10)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['Abe', 'Zed']);
  });

  it('keeps editorial order ascending even when rating sort is ascending', () => {
    const sorted = [tool('A', 4, 50), tool('B', 4, 30)].sort((a, b) => compareTools(a, b, 'rating', 'asc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });
});

describe('compareTools, other sort keys', () => {
  it('sorts by name without consulting order', () => {
    const sorted = [tool('B', 1, 10), tool('A', 5, 20)].sort((a, b) => compareTools(a, b, 'name', 'asc'));
    expect(sorted.map((t) => t.name)).toEqual(['A', 'B']);
  });

  it('sorts by pricing string', () => {
    const sorted = [tool('A', 1, 10, 'b-plan'), tool('B', 5, 20, 'a-plan')].sort((a, b) => compareTools(a, b, 'pricing', 'asc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });
});
