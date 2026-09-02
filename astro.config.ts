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
  redirects: {
    // the ECG library moved under /cardiology on 2026-09-02; these are the
    // paths that were publicly live before the move
    '/ecg': '/cardiology/ecg',
    '/ecg/normal': '/cardiology/ecg/normal',
    '/ecg/sinus-tachycardia': '/cardiology/ecg/sinus-tachycardia',
    '/ecg/sinus-bradycardia': '/cardiology/ecg/sinus-bradycardia',
    '/ecg/sinus-arrhythmia': '/cardiology/ecg/sinus-arrhythmia',
    '/ecg/atrial-fibrillation': '/cardiology/ecg/atrial-fibrillation',
    '/ecg/atrial-flutter': '/cardiology/ecg/atrial-flutter',
    '/ecg/svt': '/cardiology/ecg/svt',
    '/ecg/pvc': '/cardiology/ecg/pvc',
    '/ecg/bigeminy': '/cardiology/ecg/bigeminy',
    '/ecg/paced': '/cardiology/ecg/paced',
    '/ecg/first-degree-av-block': '/cardiology/ecg/first-degree-av-block',
    '/ecg/second-degree-av-block': '/cardiology/ecg/second-degree-av-block',
    '/ecg/third-degree-av-block': '/cardiology/ecg/third-degree-av-block',
    '/ecg/crbbb': '/cardiology/ecg/crbbb',
    '/ecg/irbbb': '/cardiology/ecg/irbbb',
    '/ecg/clbbb': '/cardiology/ecg/clbbb',
    '/ecg/lafb': '/cardiology/ecg/lafb',
    '/ecg/lpfb': '/cardiology/ecg/lpfb',
    '/ecg/ivcd': '/cardiology/ecg/ivcd',
    '/ecg/wpw': '/cardiology/ecg/wpw',
    '/ecg/lvh': '/cardiology/ecg/lvh',
    '/ecg/rvh': '/cardiology/ecg/rvh',
    '/ecg/lae': '/cardiology/ecg/lae',
    '/ecg/rae': '/cardiology/ecg/rae',
    '/ecg/inferior-mi': '/cardiology/ecg/inferior-mi',
    '/ecg/anteroseptal-mi': '/cardiology/ecg/anteroseptal-mi',
    '/ecg/anterolateral-mi': '/cardiology/ecg/anterolateral-mi',
    '/ecg/inferolateral-mi': '/cardiology/ecg/inferolateral-mi',
    '/ecg/ischemic-st-t': '/cardiology/ecg/ischemic-st-t',
    '/ecg/subendocardial-injury': '/cardiology/ecg/subendocardial-injury',
    '/ecg/long-qt': '/cardiology/ecg/long-qt',
    '/ecg/digitalis-effect': '/cardiology/ecg/digitalis-effect',
  },
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
