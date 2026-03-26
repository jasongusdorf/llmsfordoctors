/**
 * Generate static OG images for key site pages.
 *
 * Usage: npx tsx scripts/generate-og.ts
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { generateOgImage } from '../src/utils/og.js';

interface PageEntry {
  /** Output path relative to public/og/, without extension */
  path: string;
  title: string;
  subtitle?: string;
}

const pages: PageEntry[] = [
  { path: 'home', title: 'LLMs for Doctors', subtitle: 'Practical AI workflows, tools, and templates for clinicians' },
  { path: 'guides', title: 'Clinical AI Guides' },
  { path: 'editorials', title: 'Editorials' },
  { path: 'tools', title: 'AI Tools for Clinicians' },
  { path: 'templates', title: 'Prompt Templates' },
  { path: 'trials', title: 'Clinical AI Trial Reviews' },
  { path: 'workflows', title: 'Clinical AI Workflows' },
  { path: 'videos', title: 'Videos' },
  { path: 'community', title: 'Physician Community' },
  { path: 'about', title: 'About LLMs for Doctors' },
  { path: 'donate', title: 'Support LLMs for Doctors' },
];

const outDir = join(import.meta.dirname!, '..', 'public', 'og');

async function main() {
  console.log(`Generating ${pages.length} OG images...\n`);

  for (const page of pages) {
    const outPath = join(outDir, `${page.path}.png`);
    await mkdir(dirname(outPath), { recursive: true });

    const buf = await generateOgImage(page.title, page.subtitle);
    await writeFile(outPath, buf);

    console.log(`  ${outPath}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
