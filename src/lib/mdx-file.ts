import { parse as yamlParse, stringify as yamlStringify } from 'yaml';

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

  const fmText = JSON.stringify(frontmatter);
  if (body.includes(EM_DASH) || fmText.includes(EM_DASH)) {
    errors.push('Contains an em dash (U+2014); use a colon, comma, semicolon, or hyphen instead');
  }

  const social = frontmatter.socialPost;
  if (typeof social === 'string' && social.length > 256) {
    errors.push(`socialPost is ${social.length} chars; max is 256`);
  }

  return errors;
}
