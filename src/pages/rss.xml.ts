import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const [guides, trials] = await Promise.all([
    getCollection('guides'),
    getCollection('trials'),
  ]);

  // Combine and sort by lastUpdated descending
  const items = [
    ...guides.map((g) => ({
      title: g.data.title,
      pubDate: g.data.lastUpdated,
      description: g.data.description,
      link: `/guides/${g.id}/`,
    })),
    ...trials.map((t) => ({
      title: t.data.title,
      pubDate: t.data.lastUpdated,
      description: `${t.data.journal} (${t.data.year}) - ${t.data.keyFinding}`,
      link: `/trials/${t.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'LLMs for Doctors',
    description: 'Practical AI guides, trial reviews, and clinical workflows for physicians.',
    site: context.site!,
    items,
    customData: `<language>en-us</language>`,
  });
}
