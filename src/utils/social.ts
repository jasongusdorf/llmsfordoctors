import { createHmac, randomBytes } from 'node:crypto';

// --- Types ---

export interface OAuthParams {
  method: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  body?: string;
}

export interface ContentItem {
  id: string;
  collection: string;
  socialPost: string;
  url: string;
}

export interface PostedEntry {
  slug: string;
  collection: string;
  postedAt: string;
}

const COLLECTION_WEIGHTS: Record<string, number> = {
  trials: 0.35,
  tools: 0.20,
  editorials: 0.15,
  guides: 0.10,
  workflows: 0.10,
  templates: 0.05,
  videos: 0.05,
};

const COLLECTION_URL_PREFIX: Record<string, string> = {
  trials: '/trials/',
  tools: '/tools/',
  editorials: '/editorials/',
  guides: '/guides/',
  workflows: '/workflows/',
  templates: '/templates/',
  videos: '/videos/',
};

// --- OAuth 1.0a ---

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function buildOAuthHeader(params: OAuthParams): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString('hex');

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: params.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: params.accessToken,
    oauth_version: '1.0',
  };

  // Build parameter string (sorted)
  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join('&');

  // Build signature base string
  const baseString = [
    params.method.toUpperCase(),
    percentEncode(params.url),
    percentEncode(paramString),
  ].join('&');

  // Build signing key
  const signingKey = `${percentEncode(params.apiSecret)}&${percentEncode(params.accessSecret)}`;

  // HMAC-SHA1
  const signature = createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  // Build header
  const headerString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

// --- Content Selection ---

export function pickCollection(random: number): string {
  let cumulative = 0;
  for (const [collection, weight] of Object.entries(COLLECTION_WEIGHTS)) {
    cumulative += weight;
    if (random < cumulative) return collection;
  }
  return 'trials'; // fallback
}

export function filterEligible(
  items: ContentItem[],
  collection: string,
  postedLog: PostedEntry[],
): ContentItem[] {
  const postedSlugs = new Set(
    postedLog
      .filter((e) => e.collection === collection)
      .map((e) => e.slug),
  );
  return items.filter(
    (item) => item.collection === collection && item.socialPost && !postedSlugs.has(item.id),
  );
}

export function selectContent(
  allItems: ContentItem[],
  postedLog: PostedEntry[],
  maxAttempts = 3,
): ContentItem | null {
  for (let i = 0; i < maxAttempts; i++) {
    const collection = pickCollection(Math.random());
    const eligible = filterEligible(allItems, collection, postedLog);
    if (eligible.length > 0) {
      return eligible[Math.floor(Math.random() * eligible.length)];
    }
  }

  // Fallback: any eligible item across all collections
  const allPostedSlugs = new Set(postedLog.map((e) => `${e.collection}:${e.slug}`));
  const anyEligible = allItems.filter(
    (item) => item.socialPost && !allPostedSlugs.has(`${item.collection}:${item.id}`),
  );
  if (anyEligible.length > 0) {
    return anyEligible[Math.floor(Math.random() * anyEligible.length)];
  }

  return null;
}

export function buildTweetText(item: ContentItem, siteUrl: string): string {
  const path = COLLECTION_URL_PREFIX[item.collection] ?? `/${item.collection}/`;
  return `${item.socialPost} ${siteUrl}${path}${item.id}`;
}

export function shouldResetCollection(
  allItems: ContentItem[],
  collection: string,
  postedLog: PostedEntry[],
): boolean {
  const eligible = allItems.filter(
    (item) => item.collection === collection && item.socialPost,
  );
  const posted = postedLog.filter((e) => e.collection === collection);
  return eligible.length > 0 && posted.length >= eligible.length;
}

export function resetCollectionFromLog(
  postedLog: PostedEntry[],
  collection: string,
): PostedEntry[] {
  return postedLog.filter((e) => e.collection !== collection);
}

// --- X API ---

export async function postTweet(
  text: string,
  credentials: { apiKey: string; apiSecret: string; accessToken: string; accessSecret: string },
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const url = 'https://api.x.com/2/tweets';
  const body = JSON.stringify({ text });

  const authHeader = buildOAuthHeader({
    method: 'POST',
    url,
    body,
    ...credentials,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return { success: false, error: `${response.status}: ${errorBody}` };
  }

  const data = await response.json() as { data?: { id?: string } };
  return { success: true, tweetId: data.data?.id };
}
