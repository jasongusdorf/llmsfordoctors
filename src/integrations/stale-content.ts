import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

function extractLastUpdated(filePath: string): Date | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/lastUpdated:\s*(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return new Date(match[1]);
    }
  } catch {
    // ignore read errors
  }
  return null;
}

export default function staleContentChecker(): AstroIntegration {
  return {
    name: 'stale-content-checker',
    hooks: {
      'astro:build:done': async ({ logger }) => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const collections = ['workflows', 'guides', 'tools', 'templates', 'trials'] as const;

        // Walk the content directories directly using fs/glob to avoid
        // astro:content dynamic import limitations in build hooks
        const projectRoot = path.resolve(process.cwd());
        let staleCount = 0;

        for (const name of collections) {
          const contentDir = path.join(projectRoot, 'src', 'content', name);
          if (!fs.existsSync(contentDir)) continue;

          const files = fs.readdirSync(contentDir).filter((f) => /\.(md|mdx)$/.test(f));

          for (const file of files) {
            const filePath = path.join(contentDir, file);
            const lastUpdated = extractLastUpdated(filePath);
            if (lastUpdated && lastUpdated < sixMonthsAgo) {
              const slug = file.replace(/\.(md|mdx)$/, '');
              logger.warn(
                `STALE: ${name}/${slug} last updated ${lastUpdated.toISOString().slice(0, 10)}`
              );
              staleCount++;
            }
          }
        }

        if (staleCount === 0) {
          logger.info('Stale content check: all content is up to date (within 6 months).');
        } else {
          logger.warn(`Stale content check: ${staleCount} item(s) need review.`);
        }
      },
    },
  };
}
