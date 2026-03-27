import { readFileSync, writeFileSync } from 'node:fs';

const DIST_SERVER = 'dist/server';
const WRANGLER_PATH = `${DIST_SERVER}/wrangler.json`;
const WRAPPER_PATH = `${DIST_SERVER}/worker-entry.mjs`;

// 1. Create wrapper entry that delegates fetch to Astro and adds scheduled handler
const wrapper = `import handler from './entry.mjs';

export default {
  fetch(request, env, ctx) {
    return handler.fetch(request, env, ctx);
  },

  async scheduled(event, env, ctx) {
    const base = 'https://llmsfordoctors.com';
    const headers = { 'Authorization': 'Bearer ' + env.CRON_SECRET };

    console.log('[cron] Starting scheduled news refresh...');
    try {
      const res = await fetch(base + '/api/refresh-news', { method: 'POST', headers });
      const data = await res.json();
      console.log('[cron] Refresh result:', JSON.stringify(data));
    } catch (err) {
      console.error('[cron] Scheduled refresh failed:', err);
    }

    console.log('[cron] Starting scheduled social post...');
    try {
      const res = await fetch(base + '/api/post-social', { method: 'POST', headers });
      const data = await res.json();
      console.log('[cron] Social post result:', JSON.stringify(data));
    } catch (err) {
      console.error('[cron] Scheduled social post failed:', err);
    }
  },
};
`;

writeFileSync(WRAPPER_PATH, wrapper);
console.log('[post-build] Created worker-entry.mjs');

// 2. Patch the generated wrangler.json
const wrangler = JSON.parse(readFileSync(WRANGLER_PATH, 'utf-8'));

// Point main to our wrapper instead of the raw Astro entry
wrangler.main = 'worker-entry.mjs';

// Add cron trigger
if (!wrangler.triggers) wrangler.triggers = {};
wrangler.triggers.crons = ['0 6 * * *'];

// Ensure KV namespace is present
if (!wrangler.kv_namespaces) wrangler.kv_namespaces = [];
if (!wrangler.kv_namespaces.some((ns) => ns.binding === 'NEWS_CACHE')) {
  // Read the production ID from the root wrangler.jsonc
  const rootConfig = JSON.parse(
    readFileSync('wrangler.jsonc', 'utf-8')
      .replace(/\/\/.*$/gm, '')  // strip single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // strip block comments
  );
  const newsKv = rootConfig.kv_namespaces?.find((ns) => ns.binding === 'NEWS_CACHE');
  if (newsKv) {
    wrangler.kv_namespaces.push(newsKv);
  } else {
    console.warn('[post-build] WARNING: NEWS_CACHE KV namespace not found in root wrangler.jsonc');
  }
}

writeFileSync(WRANGLER_PATH, JSON.stringify(wrangler, null, 2));
console.log('[post-build] Patched wrangler.json with cron trigger and KV binding');
