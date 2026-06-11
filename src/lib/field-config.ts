export const WORKFLOW_CATEGORIES = [
  'note-writing', 'clinical-reasoning', 'patient-education',
  'literature-review', 'admin-billing', 'board-prep',
] as const;
export const TOOL_CATEGORIES = [...WORKFLOW_CATEGORIES, 'general'] as const;
export const VIDEO_CATEGORIES = ['tutorial', 'lecture', 'demo', 'interview'] as const;

export type FieldKind =
  | { kind: 'stars'; min: number; max: number }
  | { kind: 'chips-enum'; options: readonly string[] }
  | { kind: 'chips' }
  | { kind: 'select'; options: readonly string[] }
  | { kind: 'textarea' }
  | { kind: 'date' }
  | { kind: 'number'; min?: number; max?: number; help?: string }
  | { kind: 'readonly' };

const CHIPS_FIELDS = new Set(['tags', 'llm', 'topic', 'tools', 'templates', 'trials', 'specialty']);
const TEXTAREA_FIELDS = new Set(['socialPost', 'verdict', 'description', 'summary', 'keyFinding']);
const DATE_FIELDS = new Set(['lastUpdated', 'dateAdded']);

export function fieldKindFor(collection: string, key: string): FieldKind | undefined {
  if (key === 'slug') return { kind: 'readonly' };
  if (collection === 'tools' && key === 'rating') return { kind: 'stars', min: 0, max: 5 };
  if (collection === 'tools' && key === 'categories') return { kind: 'chips-enum', options: TOOL_CATEGORIES };
  if (collection === 'workflows' && key === 'category') return { kind: 'select', options: WORKFLOW_CATEGORIES };
  if (collection === 'videos' && key === 'category') return { kind: 'select', options: VIDEO_CATEGORIES };
  if (collection === 'videos' && key === 'priority') return { kind: 'number', min: 1, max: 5 };
  if (collection === 'tools' && key === 'order') {
    return { kind: 'number', help: 'Position within a rating tier; lower appears first. Use multiples of 10.' };
  }
  if (CHIPS_FIELDS.has(key)) return { kind: 'chips' };
  if (TEXTAREA_FIELDS.has(key)) return { kind: 'textarea' };
  if (DATE_FIELDS.has(key)) return { kind: 'date' };
  if (key === 'timeToRead' || key === 'year') return { kind: 'number' };
  return undefined;
}
