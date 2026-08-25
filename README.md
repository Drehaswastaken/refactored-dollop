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
- **Shareable links, no backend** — the entire bouquet (flowers, counts, wrap,
  recipient name, note) is encoded into the URL
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

No database. No server. No accounts.

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
  relative asset base are already configured
- **Netlify / GitHub Pages / any static host** — upload or serve `dist/`

Share links look like:

```
https://your-site.vercel.app/#/b/eyJ2IjoxLCJuIjoi…
```

Because routing is hash-based, they work everywhere — no server config required.

## Project Structure

```
src/
  lib/
    bouquet.ts            types, URL codec, arrangement slots, stem distribution
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

A bouquet is packed into a compact binary format and base64url-encoded into
the URL hash:

```
[version][wrap][stemCount][nameLen][name…][msgLen×2][message…][stems: 3 bits each]
```

- Stems are 3-bit flower-type indices mapped to hand-authored arrangement slots
  (center-out, depth-sorted)
- A typical link is ~100 characters (minimum ~12); the note text is the only
  part that grows the link
- Links are self-contained and permanent: no server can lose them
- Pre-v2 JSON links still decode (legacy fallback)
- Corrupt or truncated links fall back to a gentle "wilted bouquet" screen

## Design Notes

- Warm ivory / blush / rose / botanical palette, Cormorant Garamond + Outfit +
  Caveat type pairing
- Flowers are pure SVG `<g>` groups so stems, blooms and wrappers share one
  coordinate system — everything stays connected at any size
- Dark mode is a separate intentional palette (deep forest, wine, muted rose,
  moonlit sage), persisted to `localStorage` and synced with the OS preference
