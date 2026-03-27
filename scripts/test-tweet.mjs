import { createHmac, randomBytes } from 'node:crypto';

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

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join('&');
  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessSecret)}`;
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

const url = 'https://api.x.com/2/tweets';
const body = JSON.stringify({ text: 'Testing the LLMs for Doctors automated posting pipeline.' });

const header = buildOAuthHeader({
  method: 'POST',
  url,
  apiKey: 'SclM56jRF2M1XAlUpYqgDMWtg',
  apiSecret: 'L5XztPIN9aKXQs3Vqu9NXfDAlEC9mpkP7FYT3dfm0axmCdaSYM',
  accessToken: '2037506734529421312-sUzJNKMMdWbYUKOpXpqrUSOkSXRMuU',
  accessSecret: 'PU0FlaNIjwRal8T0lbd14d5x7fMYrm8Sw6kd0rzsYamBs',
});

const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: header, 'Content-Type': 'application/json' },
  body,
});

console.log('Status:', res.status);
const responseHeaders = {};
res.headers.forEach((v, k) => { responseHeaders[k] = v; });
console.log('Rate limit remaining:', responseHeaders['x-rate-limit-remaining']);
console.log('Body:', await res.text());
