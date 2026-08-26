# AGENTS.md

Working guide for AI coding agents (and humans) contributing to DigiBouquet.
For what the product *is* and exact behavioral contracts, read `spec.md`.

## What this is

A digital bouquet builder: pick flowers, write a note, share a link. React 19 +
TypeScript + Vite + Tailwind v4 + Framer Motion, hash-based routing, deployed on
Vercel with optional serverless link-shortening backed by Upstash-compatible
Redis REST.

## Commands

```bash
npm run dev        # vite dev server
npm run build      # tsc --noEmit && vite build  ← THE typecheck gate; no separate lint
npm run preview    # serve production build
npm run test:api   # functional tests for the link service (bundled + mocked Redis, no network)
```

There is no ESLint/Prettier config. `npm run build` is the only automated gate;
`npm run test:api` covers the serverless API and client fetch helpers end-to-end
against an in-memory Redis mock. Both must pass before you consider work done.
No unit-test framework exists for UI code — verify visual/flow changes by
running `npm run dev` and walking through Builder → Share → Recipient.

## File map

```
api/
  bouquet.ts            Vercel function: POST /api/bouquet (create), GET ?id= (fetch)
  _store.ts             Redis REST client, payload validation, ID gen, rate limit
scripts/
  test-api.mjs          Functional test harness (esbuild-bundles api+client, mocked Redis)
src/
  main.tsx              Entry; StrictMode; imports index.css
  App.tsx               HashRouter + routes + ambient layers (Background, petals, ThemeToggle)
  index.css             Tailwind v4 @theme tokens (light palette) + .dark overrides + keyframes
  lib/
    bouquet.ts          Domain model, arrangement slots, inline URL codec, slug helpers
    shareApi.ts         Client calls to /api/bouquet with graceful-fallback semantics
  pages/
    Landing.tsx         Hero garden
    Builder.tsx         Stem picker + wrap picker + note; hands encoded data to /created?s=…
    Share.tsx           Asks API for short ID, shows copy/share card, falls back to legacy URL
    OpenLink.tsx        Paste-a-link fallback; regex-extracts slug and navigates to /b/:slug
    Recipient.tsx       Reveal story (sealed → growing → revealed); loads short IDs async
  components/
    Bouquet.tsx         SVG renderer; modes idle | converge | grow
    flowers/index.tsx   7 hand-drawn SVG species (FlowerArt/Bloom), greenery, FLOWER_LABELS
    Wrapper.tsx         4 paper/ribbon wraps + swatches + descriptions
    NoteCard.tsx        Handwritten-style note card
    Petals.tsx          Ambient drifting petals + PetalBurst (creation moment)
    Background.tsx      Grain, gradients, botanical line art
    ThemeToggle.tsx     Dark-mode toggle; persists localStorage 'db-theme'
    ui.tsx              Button variants, SectionLabel, fieldClasses
```

## Domain model (do not break)

- `BouquetData = { v: 1, n: name, m: message, w: wrapIndex, f: number[] }`
- **`FLOWER_TYPES` order is persisted data** — indices are stored in links and
  Redis. Never reorder, only append (and then bump validation everywhere).
- Same for `WRAP_STYLES` order (`w` index).
- Stems: builder enforces 6–15 (`MIN_STEMS`, `MAX_STEMS = SLOTS.length = 15`);
  each stem packs into 3 bits (values 0–6).
- Arrangement: `sequenceFromCounts` round-robins flower types in `FLOWER_TYPES`
  order into a sequence; `SLOTS` maps sequence position → position/rotation/
  scale/z-depth (center-out, depth-sorted). Greenery count =
  `min(6, 2 + floor(stems / 4))`.
- Limits enforced in three places that must stay in sync: Builder inputs,
  `sanitizeBouquet` (api/_store.ts), client `parseBouquet` (shareApi.ts).

## Sharing contract (three coexisting generations)

1. **Short ID (current):** `…/#/b/<7-char base62>` — bouquet stored server-side.
2. **Inline binary (fallback + old links):** `…/#/b/<base64url payload>` —
   layout documented in spec.md §4.2.
3. **Legacy JSON (pre-v2):** first decoded byte is `{`; still supported.

Classification: `isShortId(s)` = `/^[A-Za-z0-9_-]{4,11}$/` (src/lib/bouquet.ts).
Every Builder-produced inline payload is ≥12 chars (6-stem minimum ⇒ 9 bytes),
so ranges don't overlap in practice. If you ever change ID length/alphabet,
update this predicate AND `isValidId` (api/_store.ts) AND the client id check
(shareApi.ts) together.

**Iron rule: sharing must never hard-fail.** Every API interaction degrades:
unconfigured/unreachable storage → Share shows the self-contained legacy URL;
failed short-ID fetch → Recipient shows the "wilted" screen. Preserve this.

## Serverless API notes

- Runs on Vercel's Node runtime using Web `Request`/`Response` signatures.
  Types come from tsconfig's DOM lib — there is intentionally no `@types/node`;
  `_store.ts` declares a minimal `process` itself. Keep it that way unless you
  have a real reason.
- Storage: Upstash-compatible REST pipeline (`KV_REST_API_URL`/`TOKEN` from
  Vercel Marketplace KV, or `UPSTASH_REDIS_REST_URL`/`TOKEN` direct). Keys
  `bq:<id>` → JSON value, TTL 365 days.
- TTL refresh on read uses `EXPIRE key ttl XX` — **not NX** (NX never applies
  because SET…EX already gave the key a TTL; this was a real bug once).
- Rate limit: INCR per IP per hour bucket, fails *open* if Redis errors (sharing
  must not break), 30 creations/hour/IP. GETs are never limited.
- `vercel.json` SPA rewrite does not shadow `/api/*` when functions exist
  (filesystem wins). But on hosts without functions the rewrite serves HTML
  with status 200 — that's why `readJson` (shareApi.ts) checks content-type
  before parsing, not just `res.ok`.

## Conventions

- TypeScript strict + `noUnusedLocals`/`noUnusedParameters` +
  `verbatimModuleSyntax` → always `import type { … }` for type-only imports.
- Styling: Tailwind v4 with semantic tokens defined in `@theme`
  (bg-canvas, bg-card, text-ink, text-inksoft, border-line, accent family,
  sage family, shadow-petal, shadow-card, animate-sway/breathe, font-hand).
  Dark mode = `.dark` class overriding CSS vars (not media queries) — new colors
  need both light and dark values in index.css. Never hardcode hex in TSX.
- Framer Motion patterns: page fades use `ease: [0.22, 1, 0.36, 1]`; SVG parts
  animate via nested `<motion.g style={{ transformBox: 'fill-box', … }}>`.
- Routing stays HashRouter so links work on any static host and all previously
  shared URLs keep resolving. Do not switch to BrowserRouter without a
  migration plan for every existing link.
- `vite.config.ts` uses `base: './'` (relative assets) — required for static
  hosts outside domain root; don't change casually.
- Match surrounding code style; minimal comments (only non-obvious invariants);
  no new runtime dependencies without strong justification.

## Gotchas

- `tsconfig.json` includes both `src` and `api` — `npm run build` typechecks the
  functions too. `"types": ["vite/client"]` restricts global type packages;
  don't add globals casually.
- `dist/` is gitignored; deploys rebuild fresh.
- `Builder → Share` handoff passes the *inline-encoded* payload via
  `/created?s=…`; Share re-stores it via API. Internal handoff, not a public URL.
- The mock Redis in scripts/test-api.mjs implements real command semantics
  (SET NX returns null result on collision, EXPIRE XX/NX rules) — keep it honest
  if you change Redis usage, or the tests will lie to you.

## Before finishing

1. `npm run build` — zero errors
2. `npm run test:api` — all assertions pass
3. If you touched codec/sharing/UI flow: walk Landing → Create → Share (link
   appears, copy works) → open link in fresh context → note + flowers correct;
   also paste one old long link and confirm it still opens.
