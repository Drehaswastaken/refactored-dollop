# DigiBouquet 🌷

**Flowers, but make them digital.**

A tiny digital love letter disguised as a bouquet. Pick the flowers, write the note,
and send someone a bouquet that grows out of their screen — stems first, blooms one
by one, ribbon tied last.

Built as a keepsake, not a web form.

---

## Features

- **Interactive bouquet builder** — hand-arranged live preview, per-flower stem
  counts (6–15 stems), 4 wrapping styles (Classic, Romantic, Wildflower, Elegant)
- **7 hand-crafted SVG flower species** — Rose, Tulip, Daisy, Peony, Lavender,
  Ranunculus, Sunflower — with eucalyptus greenery and layered depth
- **Shareable links** — every bouquet gets a short link (`/b/x7Kp9a`-style) via a
  tiny serverless API; without storage configured it falls back to fully
  self-contained encoded links so sharing never breaks
- **Recipient experience** — an interactive story: the bouquet grows onto the
  screen, then the note card fades in
- **Night-garden dark mode** — a moonlit version, not a color inversion
- **Ambient life everywhere** — drifting petals, swaying blooms, paper grain,
  botanical line-art, soft micro-interactions

## Tech Stack

| | |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 (design tokens via `@theme`) |
| Animation | Framer Motion |
| Routing | React Router (hash-based — works on any static host) |
| Link service | Vercel Function + Upstash-compatible Redis REST (optional) |

No accounts. The Redis store is optional — see below.

## Getting Started

```bash
npm install
npm run dev       # start dev server
npm run build     # typecheck + production build
npm run preview   # serve the production build
```

## Deploying

`npm run build` outputs a fully static `dist/` folder.

- **Vercel** — import the repo and deploy; `vercel.json` (SPA rewrite) and the
  relative asset base are already configured. The `api/` folder deploys as
  serverless functions automatically.
- **Netlify / GitHub Pages / any static host** — upload or serve `dist/`
  (short links need the API, so hosts without functions fall back to
  self-contained links)

Share links look like:

```
https://your-site.vercel.app/#/b/x7Kp9a     ← with storage configured
https://your-site.vercel.app/#/b/AgEJBk5h…  ← fallback (self-contained)
```

### Enabling short links (one-time setup)

The API stores bouquets in any Upstash-compatible Redis REST endpoint:

1. Create a free database at [upstash.com](https://upstash.com) **or** add
   **Vercel KV / Marketplace Redis** from your Vercel project's *Storage* tab
2. Set these environment variables on the Vercel project (Marketplace integrations
   inject them for you):

   | Variable | Source |
   |---|---|
   | `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Vercel Marketplace KV |
   | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Direct Upstash account |

3. Redeploy

Without those variables everything still works — the Share page simply produces
the longer self-contained links instead.

## Project Structure

```
api/
  bouquet.ts            POST /api/bouquet (create) · GET ?id= (fetch)
  _store.ts             Redis REST client, validation, IDs, rate limit
src/
  lib/
    bouquet.ts          types, URL codec, arrangement slots, stem distribution
    shareApi.ts         client helpers for the short-link service
  components/
    flowers/index.tsx     7 SVG species + greenery + leaves (pure <g> art groups)
    Bouquet.tsx           layered renderer: stems, greenery, blooms, wrapper
    Wrapper.tsx           4 paper/ribbon wrap styles
    Petals.tsx            ambient drifting petals + creation burst
    Background.tsx        paper grain, botanical line-art, soft gradients
    NoteCard.tsx          handwritten note card
    ui.tsx, ThemeToggle.tsx
  pages/
    Landing.tsx           hero garden
    Builder.tsx           flower picker + steppers + live preview
    Share.tsx             link card, copy/share, "Create Another"
    Recipient.tsx         the 4-scene reveal (sealed → growing → revealed)
    OpenLink.tsx          paste-a-link fallback
```

## How Sharing Works

**Short links (default when storage is configured).** On the Share page the
bouquet is POSTed to `/api/bouquet`, validated, stored in Redis under a random
7-character ID, and the recipient link becomes `/#/b/<id>`. Opening a short
link fetches the bouquet from `GET /api/bouquet?id=<id>`. Entries expire after
one year but the TTL refreshes on every open, so bouquets that are revisited
stay alive. Creation is rate-limited per IP to protect the free tier.

**Self-contained links (fallback / legacy).** The bouquet is packed into a
compact binary format and base64url-encoded into the URL hash:

```
[version][wrap][stemCount][nameLen][name…][msgLen×2][message…][stems: 3 bits each]
```

- Stems are 3-bit flower-type indices mapped to hand-authored arrangement slots
  (center-out, depth-sorted)
- Pre-v2 JSON links still decode (legacy fallback)
- Corrupt or truncated links fall back to a gentle "wilted bouquet" screen

A slug of ≤11 characters is treated as a server-side short ID; anything longer
is decoded inline, so both styles coexist transparently.

## Design Notes

- Warm ivory / blush / rose / botanical palette, Cormorant Garamond + Outfit +
  Caveat type pairing
- Flowers are pure SVG `<g>` groups so stems, blooms and wrappers share one
  coordinate system — everything stays connected at any size
- Dark mode is a separate intentional palette (deep forest, wine, muted rose,
  moonlit sage), persisted to `localStorage` and synced with the OS preference
