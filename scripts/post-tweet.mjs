#!/usr/bin/env node

// Posts the daily tweet to X via local machine (bypasses Cloudflare Worker IP block).
// The Worker handles content selection, KV logging, and queue management.
// This script handles the actual X API call from a non-cloud IP.
//
// Run manually:  node scripts/post-tweet.mjs
// Or via crontab: 0 9 * * * cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && node scripts/post-tweet.mjs >> /tmp/llmsfordoctors-tweet.log 2>&1

import { createHmac, randomBytes } from 'node:crypto';

const WORKER_URL = 'https://llmsfordoctors.jasongusdorf.workers.dev/api/post-social';
const CRON_SECRET = 'llmsdocs-cron-secret-2026';
const API_KEY = 'SclM56jRF2M1XAlUpYqgDMWtg';
const API_SECRET = 'L5XztPIN9aKXQs3Vqu9NXfDAlEC9mpkP7FYT3dfm0axmCdaSYM';
const ACCESS_TOKEN = '2037506734529421312-sUzJNKMMdWbYUKOpXpqrUSOkSXRMuU';
const ACCESS_SECRET = 'PU0FlaNIjwRal8T0lbd14d5x7fMYrm8Sw6kd0rzsYamBs';

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildOAuthHeader({ method, url, apiKey, apiSecret, accessToken, accessSecret }) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString('hex');
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  };
  const paramString = Object.keys(oauthParams).sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`).join('&');
  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join('&');
  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessSecret)}`;
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');
  oauthParams.oauth_signature = signature;
  const headerString = Object.keys(oauthParams).sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`).join(', ');
  return `OAuth ${headerString}`;
}

// Step 1: Ask the Worker to select content and attempt to post.
// The Worker handles selection, queue, and KV logging.
console.log(`[${new Date().toISOString()}] Requesting content selection from Worker...`);

const workerRes = await fetch(WORKER_URL, {
  method: 'POST',
  headers: { Authorization: `Bearer ${CRON_SECRET}`, 'Content-Type': 'application/json' },
});

const data = await workerRes.json();

// If the Worker posted successfully (X not blocking from Worker), done.
if (data.posted) {
  console.log(`[${new Date().toISOString()}] Worker posted directly: ${data.text}`);
  console.log(`Tweet ID: ${data.tweetId}`);
  process.exit(0);
}

// If no content to post, done.
if (!data.text) {
  console.log(`[${new Date().toISOString()}] No content to post:`, data);
  process.exit(0);
}

// Step 2: Worker selected content but X rejected it (403 from cloud IP).
// Post from this machine instead.
console.log(`[${new Date().toISOString()}] Worker selected: ${data.item} (${data.collection})`);
console.log(`Tweet text: ${data.text}`);
console.log('Posting from local machine...');

const xUrl = 'https://api.x.com/2/tweets';
const body = JSON.stringify({ text: data.text });

const header = buildOAuthHeader({
  method: 'POST', url: xUrl,
  apiKey: API_KEY, apiSecret: API_SECRET,
  accessToken: ACCESS_TOKEN, accessSecret: ACCESS_SECRET,
});

const xRes = await fetch(xUrl, {
  method: 'POST',
  headers: { Authorization: header, 'Content-Type': 'application/json' },
  body,
});

const xData = await xRes.json();

if (xRes.status === 201) {
  console.log(`[${new Date().toISOString()}] Tweet posted! ID: ${xData.data?.id}`);
  console.log(`https://x.com/llmsfordoctors/status/${xData.data?.id}`);
} else {
  console.error(`[${new Date().toISOString()}] X API error:`, xRes.status, JSON.stringify(xData));
  process.exit(1);
}
