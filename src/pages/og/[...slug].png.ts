import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../utils/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const [workflows, guides, tools, templates, trials] = await Promise.all([
    getCollection('workflows'),
    getCollection('guides'),
    getCollection('tools'),
    getCollection('templates'),
    getCollection('trials'),
  ]);

  const paths = [
    ...workflows.map((e) => ({
      params: { slug: `workflows/${e.id}` },
      props: { title: e.data.title, subtitle: undefined },
    })),
    ...guides.map((e) => ({
      params: { slug: `guides/${e.id}` },
      props: { title: e.data.title, subtitle: e.data.description },
    })),
    ...tools.map((e) => ({
      params: { slug: `tools/${e.id}` },
      props: { title: e.data.title, subtitle: e.data.verdict },
    })),
    ...templates.map((e) => ({
      params: { slug: `templates/${e.id}` },
      props: { title: e.data.title, subtitle: undefined },
    })),
    ...trials.map((e) => ({
      params: { slug: `trials/${e.id}` },
      props: { title: e.data.title, subtitle: e.data.keyFinding },
    })),
  ];

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle } = props as { title: string; subtitle?: string };
  try {
    const png = await generateOgImage(title, subtitle);
    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[OG] Failed to generate image for:', title, err);
    return new Response('Failed to generate OG image', { status: 500 });
  }
};
