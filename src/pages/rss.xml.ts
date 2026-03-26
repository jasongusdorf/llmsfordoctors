import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = false;

export async function GET(context: APIContext) {
  const [guides, editorials, workflows, trials] = await Promise.all([
    getCollection('guides'),
    getCollection('editorials'),
    getCollection('workflows'),
    getCollection('trials'),
  ]);

  const items = [
    ...guides.map((g) => ({
      title: g.data.title,
      description: g.data.description,
      link: `/guides/${g.id}/`,
      pubDate: g.data.lastUpdated,
    })),
    ...editorials.map((e) => ({
      title: e.data.title,
      description: e.data.description,
      link: `/editorials/${e.id}/`,
      pubDate: e.data.lastUpdated,
    })),
    ...workflows.map((w) => ({
      title: w.data.title,
      link: `/workflows/${w.id}/`,
      pubDate: w.data.lastUpdated,
    })),
    ...trials.map((t) => ({
      title: t.data.title,
      description: t.data.keyFinding,
      link: `/trials/${t.id}/`,
      pubDate: t.data.lastUpdated,
    })),
  ]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 50);

  return rss({
    title: 'LLMs for Doctors',
    description: 'Practical AI workflows, tools, and templates for clinicians',
    site: context.site!,
    items,
    customData: `<language>en-us</language>`,
  });
}
