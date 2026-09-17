import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = path.join(ROOT, 'public/videos/cardiology/open-cine');
const POSTER_DIR = path.join(ROOT, 'public/images/cardiology/cine-posters');
const MANIFEST = path.join(ROOT, 'src/data/cardiology-cine-media.json');
const MAX_COMMONS = Number(process.env.CARDIOLOGY_CINE_MAX_COMMONS || 52);
const MAX_SOURCE_BYTES = Number(process.env.CARDIOLOGY_CINE_MAX_SOURCE_BYTES || 30_000_000);
const USER_AGENT = 'LLMsForDoctorsCineIngest/1.0 (educational attribution pipeline)';
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const commonsCategories = [
  ['Echocardiography', 'Echo'],
  ['Magnetic resonance imaging of the heart', 'Cardiac MRI'],
  ['Cine magnetic resonance imaging', 'Cardiac MRI'],
];

const minnesotaPages = [
  ['https://www.vhlab.umn.edu/atlas/cardiac-mri-tutorial/functional-assessment.shtml', 'Cardiac MRI'],
  ['https://www.vhlab.umn.edu/atlas/cardiac-mri-tutorial/tissue-characterization.shtml', 'Cardiac MRI'],
  ['https://www.vhlab.umn.edu/atlas/cardiac-mri-tutorial/flow-characterization.shtml', 'Cardiac MRI'],
  ['https://www.vhlab.umn.edu/atlas/cardiac-mri-tutorial/anatomical-imaging-examples.shtml', 'Cardiac MRI'],
  ['https://www.vhlab.umn.edu/atlas/cardiac-mri-tutorial/functional-imaging-examples.shtml', 'Cardiac MRI'],
  ['https://www.vhlab.umn.edu/atlas/echocardiography-tutorial/what-is-echocardiography.shtml', 'Echo'],
  ['https://www.vhlab.umn.edu/atlas/echocardiography-tutorial/mitral-valve.shtml', 'Echo'],
  ['https://www.vhlab.umn.edu/atlas/echocardiography-tutorial/aortic-valve.shtml', 'Echo'],
  ['https://www.vhlab.umn.edu/atlas/echocardiography-tutorial/other-valve-images.shtml', 'Echo'],
];

const rejectTitle = /murine|mice|mouse|zebrafish|rat\b|canine|porcine|phantom|algorithm|synthetic|equipment|astronaut|thrombomodulin|transcription factor/i;
const preferredTitle = /normal|aortic|mitral|tricuspid|pulmonary|pericard|effusion|tampon|infarct|rupture|septal|gerbode|endocard|fibroelastoma|dysfunction|hypothermia|prolapse|disjunction|bicuspid|four chamber|4-ch|short axis|long axis|ventric|flow|sarcoid|fallot|danon|beriberi|dissection|regurgitation|stenosis|coronary|heart/i;
const allowedLicense = /^(cc0|pd|public domain|cc[ -]by(?:[ -]sa)?(?:[ -][\d.]+)?)/i;

function text(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|#160);/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
}

function slug(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
}

async function fetchRetry(url, attempt = 0, maxAttempts = 7) {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
    await pause(Math.min(30000, 1200 * 2 ** attempt));
    return fetchRetry(url, attempt + 1, maxAttempts);
  }
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}: ${stderr.slice(-1000)}`)));
  });
}

async function transcode(sourceUrl, id) {
  const temp = await mkdtemp(path.join(tmpdir(), 'cardiology-cine-'));
  const sourcePath = path.join(temp, 'source');
  const videoPath = path.join(OUT_DIR, `${id}.mp4`);
  const posterPath = path.join(POSTER_DIR, `${id}.jpg`);
  try {
    try {
      const video = await readFile(videoPath);
      const poster = await stat(posterPath);
      return { bytes: video.length, localSha256: createHash('sha256').update(video).digest('hex'), posterBytes: poster.size, src: `/videos/cardiology/open-cine/${id}.mp4`, poster: `/images/cardiology/cine-posters/${id}.jpg` };
    } catch {}
    const cleanSource = new URL(sourceUrl);
    cleanSource.search = '';
    const response = await fetchRetry(cleanSource, 0, 2);
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_SOURCE_BYTES) throw new Error(`source is ${length} bytes`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_SOURCE_BYTES) throw new Error(`source is ${bytes.length} bytes`);
    await writeFile(sourcePath, bytes);
    await run('ffmpeg', ['-y', '-i', sourcePath, '-an', '-vf', "scale='min(720,iw)':-2:flags=lanczos", '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', videoPath]);
    await run('ffmpeg', ['-y', '-i', videoPath, '-vf', 'thumbnail,scale=720:-2', '-frames:v', '1', '-q:v', '3', posterPath]);
    const video = await readFile(videoPath);
    const poster = await stat(posterPath);
    return { bytes: video.length, localSha256: createHash('sha256').update(video).digest('hex'), posterBytes: poster.size, src: `/videos/cardiology/open-cine/${id}.mp4`, poster: `/images/cardiology/cine-posters/${id}.jpg` };
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

async function categoryMembers(category) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  for (const [key, value] of Object.entries({ action: 'query', format: 'json', list: 'categorymembers', cmtitle: `Category:${category}`, cmtype: 'file', cmlimit: '500' })) url.searchParams.set(key, value);
  const data = await (await fetchRetry(url)).json();
  return (data.query?.categorymembers || []).map((item) => item.title).filter((title) => /\.(ogv|webm|mp4|gif)$/i.test(title) && !rejectTitle.test(title));
}

async function commonsMetadata(titles) {
  const rows = [];
  for (let index = 0; index < titles.length; index += 25) {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    for (const [key, value] of Object.entries({ action: 'query', format: 'json', prop: 'imageinfo', titles: titles.slice(index, index + 25).join('|'), iiprop: 'url|mime|size|sha1|extmetadata' })) url.searchParams.set(key, value);
    const data = await (await fetchRetry(url)).json();
    for (const page of Object.values(data.query?.pages || {})) if (page.imageinfo?.[0]) rows.push({ title: page.title, ...page.imageinfo[0] });
    await pause(200);
  }
  return rows;
}

async function commonsPlaybackUrl(row) {
  if (!/\.(ogv|webm|mp4)$/i.test(row.title)) return row.url;
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  for (const [key, value] of Object.entries({ action: 'query', format: 'json', prop: 'videoinfo', titles: row.title, viprop: 'derivatives' })) url.searchParams.set(key, value);
  const data = await (await fetchRetry(url)).json();
  const derivatives = Object.values(data.query?.pages || {})[0]?.videoinfo?.[0]?.derivatives || [];
  const webm = derivatives.filter((item) => item.type?.startsWith('video/webm') && item.width <= 720).sort((a, b) => b.width - a.width)[0];
  return webm?.src || row.url;
}

await mkdir(OUT_DIR, { recursive: true });
await mkdir(POSTER_DIR, { recursive: true });
let existing = [];
try { existing = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch {}
const bySource = new Map(existing.map((item) => [item.originalUrl, item]));
const assets = [];

for (const [page, modality] of minnesotaPages) {
  const html = await (await fetchRetry(page)).text();
  const urls = [...new Set([...html.matchAll(/(?:src|href)=["']([^"']+\.mp4)["']/gi)].map((match) => new URL(match[1], page).href))];
  for (const originalUrl of urls) {
    if (bySource.has(originalUrl)) { assets.push(bySource.get(originalUrl)); continue; }
    const filename = decodeURIComponent(new URL(originalUrl).pathname.split('/').at(-1)).replace(/\.mp4$/i, '');
    const id = `umn-cine-${slug(filename)}-${createHash('sha1').update(originalUrl).digest('hex').slice(0, 7)}`;
    try {
      const file = await transcode(originalUrl, id);
      assets.push({ id, title: text(filename.replace(/[-_]+/g, ' ')), description: `Moving ${modality.toLowerCase()} teaching example from the University of Minnesota Atlas source page. Consult the source page for its full clinical context.`, modality, category: `University of Minnesota Atlas · ${modality} cine`, mediaKind: 'video', ...file, sourcePage: page, originalUrl, creator: 'Atlas of Human Cardiac Anatomy, University of Minnesota/© Medtronic', credit: 'Atlas of Human Cardiac Anatomy, University of Minnesota/© Medtronic (www.vhlab.umn.edu/atlas)', license: 'Educational reuse permitted with watermark and citation', licenseUrl: 'https://www.vhlab.umn.edu/atlas', attributionRequired: true, changes: 'Transcoded to H.264 MP4 for browser compatibility; visual content otherwise unchanged.', mime: 'video/mp4', importedAt: new Date().toISOString() });
      console.log(`Minnesota ${assets.length}: ${filename}`);
    } catch (error) { console.warn(`Minnesota skipped ${originalUrl}: ${error.message}`); }
  }
}

const seenTitles = new Map();
for (const [category, modality] of commonsCategories) {
  for (const title of await categoryMembers(category)) if (!seenTitles.has(title)) seenTitles.set(title, { category, modality });
}
const candidates = await commonsMetadata([...seenTitles.keys()]);
candidates.sort((a, b) => Number(preferredTitle.test(b.title)) - Number(preferredTitle.test(a.title)) || a.size - b.size);
let commonsCount = 0;
for (const row of candidates) {
  if (commonsCount >= MAX_COMMONS) break;
  const meta = row.extmetadata || {};
  const license = text(meta.LicenseShortName?.value || '');
  if (!allowedLicense.test(license) || row.size > MAX_SOURCE_BYTES || rejectTitle.test(row.title)) continue;
  if (bySource.has(row.url)) { assets.push(bySource.get(row.url)); commonsCount++; continue; }
  const id = `commons-cine-${slug(row.title.replace(/^File:/, '').replace(/\.[^.]+$/, ''))}-${String(row.sha1).slice(0, 7)}`;
  try {
    const file = await transcode(await commonsPlaybackUrl(row), id);
    const { category, modality } = seenTitles.get(row.title);
    assets.push({ id, title: text(meta.ObjectName?.value || row.title.replace(/^File:/, '').replace(/\.[^.]+$/, '')), description: text(meta.ImageDescription?.value || meta.Caption?.value || row.title.replace(/^File:/, '').replace(/\.[^.]+$/, '')), modality, category: `Wikimedia Commons · ${category}`, mediaKind: 'video', ...file, sourcePage: meta.DescriptionUrl?.value || `https://commons.wikimedia.org/wiki/${encodeURIComponent(row.title).replace(/%20/g, '_')}`, originalUrl: row.url, creator: text(meta.Artist?.value || 'Wikimedia Commons contributor'), credit: text(meta.Credit?.value || ''), license, licenseUrl: meta.LicenseUrl?.value || 'https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia', attributionRequired: !/^(cc0|pd|public domain)/i.test(license), changes: 'Transcoded to H.264 MP4 and resized to a maximum width of 720 px for browser compatibility; clinical content otherwise unchanged.', mime: 'video/mp4', commonsSha1: row.sha1, importedAt: new Date().toISOString() });
    commonsCount++;
    console.log(`Commons ${commonsCount}/${MAX_COMMONS}: ${row.title}`);
  } catch (error) { console.warn(`Commons skipped ${row.title}: ${error.message}`); }
}

const unique = [...new Map(assets.map((item) => [item.originalUrl, item])).values()].sort((a, b) => a.modality.localeCompare(b.modality) || a.title.localeCompare(b.title));
await writeFile(MANIFEST, `${JSON.stringify(unique, null, 2)}\n`);
console.log(`Imported ${unique.length} licensed cine loops (${Math.round(unique.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024)} MB).`);
