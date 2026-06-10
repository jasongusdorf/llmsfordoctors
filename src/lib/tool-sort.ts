export type SortKey = 'name' | 'rating' | 'pricing';
export type SortDir = 'asc' | 'desc';

export interface SortableTool {
  name: string;
  rating: number;
  pricing: string;
  order?: number;
}

// Rating ties resolve by editorial order (always ascending, regardless of
// sortDir), then name, so equal-rated tools appear in a deliberate sequence.
export function compareTools(a: SortableTool, b: SortableTool, sortKey: SortKey, sortDir: SortDir): number {
  let valA: string | number;
  let valB: string | number;

  if (sortKey === 'name') {
    valA = a.name.toLowerCase();
    valB = b.name.toLowerCase();
  } else if (sortKey === 'rating') {
    valA = a.rating;
    valB = b.rating;
  } else {
    valA = a.pricing.toLowerCase();
    valB = b.pricing.toLowerCase();
  }

  if (valA < valB) return sortDir === 'asc' ? -1 : 1;
  if (valA > valB) return sortDir === 'asc' ? 1 : -1;

  if (sortKey === 'rating') {
    const orderA = a.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.order ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  }
  return 0;
}
