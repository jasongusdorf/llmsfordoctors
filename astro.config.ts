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
    sitemap({
      // the qualifier and cardiology trees moved under /education on 2026-09-05.
      // Their old paths still resolve as 301s, but only the canonical new URLs
      // belong in the sitemap.
      filter: (page) => {
        const path = new URL(page).pathname;
        return !(
          path.startsWith('/admin') ||
          path.startsWith('/tags') ||
          path.startsWith('/qualifiers') ||
          path.startsWith('/cardiology') ||
          path.startsWith('/ecg')
        );
      },
    }),
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
