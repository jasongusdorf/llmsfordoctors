# X/Twitter Automated Posting: Design Spec

## Purpose

Automated daily posting to `@llmsfordoctors` on X, drawing from the site's existing content collections. Each post promotes one piece of content with pre-written copy stored in the content's frontmatter.

## Account

- Handle: `@llmsfordoctors`
- Platform: X (Twitter) free tier (1,500 tweets/month)

## Content Schema Changes

Each content collection gains an optional `socialPost` field:

```ts
socialPost: z.string().optional()
```

This field holds the tweet prose (max ~200 characters). The system appends a space and the full URL automatically. No separate data store; the post lives with the content it promotes.

Applies to all seven active collections: trials, tools, templates, guides, workflows, editorials, videos.

## Post Style

A mix of two formats, chosen per-item when writing the copy:

- **Hook-with-link**: Short provocative line that pulls the reader toward the URL.
- **Standalone insight**: Self-contained takeaway that works even without a click-through, with the link as "read more."

Voice is professional but ELI20: accessible to a smart 20-year-old, not dumbed down but explained clearly. Lead with the main result; first sentence states the finding, not a hook. Use the full character budget (~220-250 chars before the URL). No em dashes. No emoji. No hype words ("game-changer," "groundbreaking," "exciting"). No inflammatory framing or editorializing beyond what the evidence supports. Claims are specific and quantified where possible. The tone of a physician explaining a study to a sharp med student, not a marketing account or a journal abstract.

## Post Selection

### Weighted random by collection

| Collection  | Weight | Rationale                          |
|-------------|--------|------------------------------------|
| Trials      | 35%    | Largest collection, most shareable |
| Tools       | 20%    | Core value prop of the site        |
| Editorials  | 15%    | Opinion pieces drive engagement    |
| Guides      | 10%    | Evergreen how-tos                  |
| Workflows   | 10%    | Practical, actionable              |
| Templates   | 5%     | Less standalone value in a tweet   |
| Videos      | 5%     | External links, less site traffic  |

### Selection algorithm

1. Roll a collection using the weights above.
2. From that collection, filter to items that (a) have a non-empty `socialPost` field and (b) do not appear in the recent posted log.
3. Pick one at random.
4. If no eligible items exist in the selected collection, re-roll (up to 3 attempts), then fall back to any eligible item across all collections.
5. If zero eligible items exist anywhere, skip the day and log a warning.

### Priority override

A manual queue (`SOCIAL_QUEUE` in KV) holds an ordered array of `{ slug, collection }`. If non-empty, the next item is popped and posted instead of running the weighted random selection. This allows timely, hand-picked posts.

## Tracking

A Cloudflare KV key (`SOCIAL_POSTED_LOG`) stores a JSON array:

```json
[
  { "slug": "gpt4-gastro", "collection": "trials", "postedAt": "2026-03-28T14:00:00Z" },
  ...
]
```

Items remain in the log to prevent repeats. Once every eligible item in a given collection has been posted, the log entries for that collection (and only that collection) are cleared, allowing its items to cycle back in. Other collections' logs are unaffected.

## Infrastructure

### Cron trigger

A new scheduled trigger in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": ["0 14 * * *"]  // 2 PM UTC daily (morning US time)
}
```

This is in addition to any existing cron triggers for news refresh.

### API route

`POST /api/post-social`

- Protected by bearer token auth (same `CRON_SECRET` pattern as `/api/refresh-news`)
- Called by the cron handler
- Can also be called manually for testing

### Flow

1. Check `SOCIAL_QUEUE` in KV. If non-empty, pop the first item.
2. Otherwise, run weighted random selection.
3. Build the tweet: `{socialPost} {fullUrl}`.
4. POST to `https://api.x.com/2/tweets` with OAuth 1.0a user-context auth.
5. On success, append entry to `SOCIAL_POSTED_LOG` in KV.
6. On failure, log the error. No automatic retry; the next day picks something else.

### X API authentication

OAuth 1.0a with four secrets stored in Cloudflare Worker secrets:

- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`

The OAuth signature (HMAC-SHA1 over a normalized request string) is computed in the Worker. No external OAuth library required.

### KV binding

New binding: `SOCIAL_STORE`

- Key `queue`: the priority override queue
- Key `posted_log`: the posted history

Separate from existing `FORM_STORE` and `NEWS_CACHE` bindings.

## What the system does NOT do

- Generate post copy at runtime (all copy is pre-written)
- Post images or media (text + link only, for now)
- Thread or multi-tweet posts
- Respond to replies or DMs
- Post to any platform other than X

## Prerequisites (user actions)

1. Create `@llmsfordoctors` X account
2. X developer account with free tier (done)
3. App with Read and Write permissions (done)
4. Four API credentials set as Cloudflare Worker secrets (done)
5. Create `SOCIAL_STORE` KV namespace and add binding to `wrangler.jsonc`

## Files to create or modify

- `src/content.config.ts`: add `socialPost` field to all collection schemas
- `src/utils/social.ts`: selection logic, OAuth signing, X API client
- `src/pages/api/post-social.ts`: API endpoint
- `wrangler.jsonc`: add cron trigger and `SOCIAL_STORE` KV binding
- All content `.mdx` files: add `socialPost` frontmatter (135 files, done in batch)
