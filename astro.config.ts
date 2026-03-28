import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import staleContentChecker from './src/integrations/stale-content';

export default defineConfig({
  site: 'https://llmsfordoctors.com',
  output: 'static',
  adapter: cloudflare({
    prerenderEnvironment: 'node',
  }),
  integrations: [
    mdx(),
    sitemap(),
    pagefind(),
    preact({ compat: true }),
    staleContentChecker(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
