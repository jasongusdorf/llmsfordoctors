import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'src/data/cardiology-guidelines.json'), 'utf8'));
const outputRoot = process.argv[2];

if (!outputRoot) {
  console.error('Usage: node scripts/download-cardiology-guidelines.mjs <output-directory>');
  process.exit(2);
}

const run = (args) => JSON.parse(execFileSync('openclaw', ['browser', ...args, '--json'], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
}));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function crossrefPdf(doi) {
  const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  if (!response.ok) throw new Error(`Crossref ${response.status} for ${doi}`);
  const body = await response.json();
  const links = body?.message?.link || [];
  const link = links.find((item) => item['content-type'] === 'application/pdf') ||
    links.find((item) => /article-pdf|\.pdf(?:\?|$)/i.test(item.URL || ''));
  if (!link?.URL) throw new Error(`No official PDF link found for ${doi}`);
  return link.URL;
}

function isPdf(path) {
  if (!existsSync(path) || statSync(path).size < 1024) return false;
  const head = readFileSync(path).subarray(0, 5).toString('ascii');
  return head === '%PDF-';
}

async function download(entry) {
  const societyFolder = entry.society.startsWith('ACC/AHA') ? 'ACC-AHA' : 'ESC';
  const target = join(outputRoot, societyFolder, entry.filename);
  mkdirSync(dirname(target), { recursive: true });
  if (isPdf(target)) {
    console.log(`SKIP ${entry.filename}`);
    return;
  }

  const pdfUrl = entry.society.startsWith('ACC/AHA')
    ? `https://www.jacc.org/doi/pdf/${entry.doi}`
    : await crossrefPdf(entry.doi);

  let tabId;
  try {
    const opened = run(['open', pdfUrl]);
    tabId = opened.suggestedTargetId || opened.tabId;
    await sleep(6500);
    const evaluated = run([
      'evaluate', '--target-id', tabId, '--fn',
      `async () => {
        const response = await fetch(location.href, { credentials: 'include' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const blob = await response.blob();
        if (blob.type !== 'application/pdf') throw new Error('Expected PDF, got ' + blob.type);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = ${JSON.stringify(entry.filename)};
        document.body.appendChild(link);
        link.click();
        return { size: blob.size, type: blob.type };
      }`,
    ]);
    const download = evaluated.downloads?.[0];
    if (!download?.path || !isPdf(download.path)) {
      throw new Error(`Browser did not produce a valid PDF for ${entry.doi}`);
    }
    try {
      renameSync(download.path, target);
    } catch {
      copyFileSync(download.path, target);
      rmSync(download.path);
    }
    console.log(`OK ${entry.filename} (${Math.round(statSync(target).size / 1024)} KB)`);
  } finally {
    if (tabId) {
      try { run(['close', tabId]); } catch {}
    }
  }
}

const failures = [];
for (const entry of manifest) {
  try {
    await download(entry);
  } catch (error) {
    failures.push({ filename: entry.filename, error: error.message });
    console.error(`FAIL ${entry.filename}: ${error.message}`);
  }
}

const valid = manifest.filter((entry) => {
  const societyFolder = entry.society.startsWith('ACC/AHA') ? 'ACC-AHA' : 'ESC';
  return isPdf(join(outputRoot, societyFolder, entry.filename));
});

console.log(`Downloaded ${valid.length}/${manifest.length} guideline PDFs.`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
