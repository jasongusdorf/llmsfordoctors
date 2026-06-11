import { parse as yamlParse, stringify as yamlStringify, parseDocument } from 'yaml';

export const COLLECTIONS = ['editorials', 'guides', 'tools', 'trials', 'templates', 'workflows', 'videos'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

export interface ParsedMdx {
  frontmatter: Record<string, unknown>;
  body: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const EM_DASH = '\u2014';

export function parseMdx(raw: string): ParsedMdx {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) throw new Error('No frontmatter block found');
  const frontmatter = (yamlParse(match[1]) ?? {}) as Record<string, unknown>;
  const body = raw.slice(match[0].length);
  return { frontmatter, body };
}

// Formatting-preserving update: only keys whose values changed are rewritten;
// untouched keys keep their original quote style, array layout, and wrapping.
export function patchMdx(
  originalRaw: string,
  frontmatter: Record<string, unknown>,
  body: string,
): string {
  const match = originalRaw.match(FRONTMATTER_RE);
  if (!match) throw new Error('No frontmatter block found');
  const doc = parseDocument(match[1]);
  const original = (doc.toJS() ?? {}) as Record<string, unknown>;

  for (const [key, value] of Object.entries(frontmatter)) {
    if (JSON.stringify(original[key]) !== JSON.stringify(value)) doc.set(key, value);
  }
  for (const key of Object.keys(original)) {
    if (!(key in frontmatter)) doc.delete(key);
  }

  const fm = doc.toString({ lineWidth: 0, flowCollectionPadding: false }).trimEnd();
  return `---\n${fm}\n---\n\n${body.replace(/^\n+/, '')}`;
}

export function serializeMdx(frontmatter: Record<string, unknown>, body: string): string {
  const fm = yamlStringify(frontmatter).trimEnd();
  return `---\n${fm}\n---\n\n${body.replace(/^\n+/, '')}`;
}

const REQUIRED: Record<CollectionName, string[]> = {
  editorials: ['title', 'description', 'tags', 'lastUpdated'],
  guides: ['title', 'description', 'tags', 'lastUpdated'],
  tools: ['title', 'slug', 'vendor', 'rating', 'verdict', 'pricing', 'hasBaa', 'categories', 'lastUpdated'],
  trials: ['title', 'journal', 'year', 'doi', 'keyFinding', 'lastUpdated', 'tags'],
  templates: ['title', 'category', 'targetTool', 'tags', 'lastUpdated'],
  workflows: ['title', 'category', 'tools', 'tags', 'timeToRead', 'lastUpdated'],
  videos: ['title', 'url', 'channel', 'summary', 'category', 'llm', 'topic', 'priority', 'dateAdded'],
};

export function isCollection(name: string): name is CollectionName {
  return (COLLECTIONS as readonly string[]).includes(name);
}

export function validateContent(
  collection: CollectionName,
  frontmatter: Record<string, unknown>,
  body: string,
): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED[collection]) {
    const v = frontmatter[field];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // The Astro build types these as z.date(); a malformed value committed by
  // the editor would fail the auto-deploy build, so guard the format here.
  for (const dateField of ['lastUpdated', 'dateAdded']) {
    const v = frontmatter[dateField];
    if (v !== undefined && !(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v))) {
      errors.push(`${dateField} must be a date in YYYY-MM-DD format`);
    }
  }

  if (collection === 'tools') {
    const rating = frontmatter.rating;
    if (rating !== undefined && (typeof rating !== 'number' || Number.isNaN(rating) || rating < 0 || rating > 5)) {
      errors.push('rating must be a number between 0 and 5');
    }
    const order = frontmatter.order;
    if (order !== undefined && (typeof order !== 'number' || !Number.isFinite(order))) {
      errors.push('order must be a number');
    }
  }

  const fmText = JSON.stringify(frontmatter);
  if (body.includes(EM_DASH) || fmText.includes(EM_DASH)) {
    errors.push('Contains an em dash (U+2014); use a colon, comma, semicolon, or hyphen instead');
  }

  return errors;
}
