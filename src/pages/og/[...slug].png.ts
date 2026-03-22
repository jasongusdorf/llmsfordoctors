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
    // Index and standalone pages
    { params: { slug: 'home' }, props: { title: 'LLMs for Doctors', subtitle: 'AI Workflows for Clinicians' } },
    { params: { slug: 'workflows' }, props: { title: 'Workflows', subtitle: 'Clinical AI workflows by category' } },
    { params: { slug: 'guides' }, props: { title: 'Guides', subtitle: 'Evidence-based AI guides for clinicians' } },
    { params: { slug: 'tools' }, props: { title: 'Tools', subtitle: 'AI tool reviews for clinical practice' } },
    { params: { slug: 'templates' }, props: { title: 'Templates', subtitle: 'Ready-to-use prompt templates' } },
    { params: { slug: 'trials' }, props: { title: 'Trials', subtitle: 'Clinical AI research and trials' } },
    { params: { slug: 'about' }, props: { title: 'About', subtitle: 'About LLMs for Doctors' } },
    { params: { slug: 'donate' }, props: { title: 'Donate', subtitle: 'Support LLMs for Doctors' } },
    // Content collection pages
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
