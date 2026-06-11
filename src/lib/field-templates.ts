import type { CollectionName } from './mdx-file';

// Blank starting frontmatter for the create flow. Every REQUIRED field for the
// collection must be present so the editor renders an input for it.
export function templateFor(collection: CollectionName): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  const templates: Record<CollectionName, Record<string, unknown>> = {
    guides: { title: '', description: '', tags: [], lastUpdated: today, featured: false, socialPost: '' },
    editorials: { title: '', description: '', tags: ['editorial'], lastUpdated: today, featured: false, socialPost: '' },
    tools: {
      title: '', slug: '', vendor: '', rating: 3, order: 999, verdict: '', pricing: '',
      hasBaa: false, categories: [], lastUpdated: today, socialPost: '',
    },
    trials: { title: '', journal: '', year: new Date().getFullYear(), doi: '', keyFinding: '', tags: [], lastUpdated: today, socialPost: '' },
    templates: { title: '', category: '', targetTool: '', tags: [], lastUpdated: today, socialPost: '' },
    workflows: { title: '', category: '', tools: [], tags: [], timeToRead: 5, lastUpdated: today, socialPost: '' },
    videos: { title: '', url: '', channel: '', summary: '', category: '', llm: [], topic: [], priority: 3, dateAdded: today, socialPost: '' },
  };
  return templates[collection];
}
