# DigiBouquet — Specification

Digital bouquet builder: pick flowers, write a handwritten-style note, share a
link. The recipient watches the bouquet grow on their screen, then reads the
note. No accounts, no tracking.

---

## 1. Goals and non-goals

**Goals**
- Sharing is one link, always openable by anyone with a browser.
- Links are as short as possible; long notes must not bloat them.
- Every previously shared link keeps working forever (forward compatibility).
- Sharing degrades gracefully — infrastructure problems never block the moment.

**Non-goals**
- User accounts, auth, analytics, editable bouquets, delivery scheduling.

## 2. Routes (HashRouter)

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Hero garden; entry to Create / Open |
| `/create` | Builder | Stem picker (6–15 stems), wrap picker, name + note |
| `/created?s=<payload>` | Share | Internal handoff from Builder; produces the shareable link |
| `/open` | OpenLink | Paste-a-link fallback; extracts slug, navigates |
| `/b/:slug` | Recipient | The reveal: sealed → growing → revealed |
| `*` | — | Redirects to `/` |

## 3. Data model

```ts
BouquetData = {
  v: 1,            // format version
  n: string,       // recipient name, ≤60 chars
  m: string,       // note text, ≤400 chars
  w: number,       // wrap index into WRAP_STYLES = [classic, romantic, wildflower, elegant]
  f: number[],     // stem sequence: indices into FLOWER_TYPES, length 1–15
}
FLOWER_TYPES = [rose, tulip, daisy, peony, lavender, ranunculus, sunflower]  // values 0–6
```

- **`FLOWER_TYPES` and `WRAP_STYLES` order is persisted data.** Indices live in
  links and Redis; only append, never reorder.
- Builder requires ≥6 stems (`MIN_STEMS`); max 15 (`MAX_STEMS`, equals
  `SLOTS.length`).
- Arrangement: `sequenceFromCounts` round-robins the chosen types in
  `FLOWER_TYPES` order into the sequence; slot *i* of `SLOTS` (15 hand-authored
  positions, center-out, z-depth-sorted) places stem *i*. Per-type counts are
  never stored — only the flattened sequence.
- Greenery: `min(6, 2 + floor(stemCount / 4))` eucalyptus sprigs from
  `GREENERY_SLOTS`; leaves appear on every third stem.

## 4. Sharing formats

Three generations coexist behind one route (`/#/b/:slug`). Classification is by
length: `isShortId(s) := /^[A-Za-z0-9_-]{4,11}$/`. Every payload the Builder
can produce is ≥12 chars (6-stem minimum ⇒ 9 bytes ⇒ 12 base64 chars), so the
ranges do not overlap in practice; only degenerate hand-crafted sub-6-stem,
empty-note payloads could collide, and they fail closed to the wilted screen.

### 4.1 Short ID links (current)

```
https://<host>/#/b/<id>        e.g. /#/b/RNKrydP   (~45 chars total)
id = 7 chars, base62 [A-Za-z0-9], generated with crypto.getRandomValues,
collision-safe via SET NX, retried up to 5 times.
```

The bouquet lives in Redis; Recipient fetches it via the API (§5).

### 4.2 Inline binary v1 (fallback + historical links)

Self-contained payload in the URL hash, base64url without padding:

```
byte 0      format = 0x02
byte 1      wrap index w            (0–3)
byte 2      stem count              (1–15)
byte 3      name byte length        (name ≤60 bytes UTF-8)
bytes 4..   name, UTF-8
next 2      message length, big-endian (≤400 bytes UTF-8)
following   message, UTF-8
remainder   stems packed MSB-first, 3 bits each (values 0–6)
```

Produced by `encodeBouquet`; used when storage is unconfigured/unreachable, and
still decoded for all previously shared links of this shape.

### 4.3 Legacy JSON (pre-v2)

First decoded byte is `{` → parse as JSON `BouquetData`. Still supported.

### 4.4 Failure mode

Undecodable/truncated slug or failed short-ID fetch → Recipient renders the
"wilted bouquet" screen with a path back to `/create`.

## 5. Link service API

Single Vercel function (`api/bouquet.ts`), Web Request/Response signature:

| Method | Path | Success | Errors |
|---|---|---|---|
| POST | `/api/bouquet` | `200 {ok:true, id}` | 400 invalid · 429 rate_limited · 502 storage_failed · 503 unconfigured |
| GET | `/api/bouquet?id=<id>` | `200 {ok:true, bouquet}` | 404 not_found · 503 unconfigured |
| other | — | — | 405 method_not_allowed |

- **Validation** (server, `sanitizeBouquet`): object with `v===1`; `n`,`m`
  strings (trimmed, capped at 60/400 chars — over-length strings are truncated,
  not rejected); `w` integer 0–3; `f` array of 1–15 integers 0–6. Anything else
  → 400. The client re-validates independently (`parseBouquet`) before render.
- **Storage**: Upstash-compatible Redis REST pipeline. Key `bq:<id>` → compact
  JSON of BouquetData. `SET key value NX EX 31536000` (365 days). Reads refresh
  the TTL with `EXPIRE key 31536000 XX` (XX because SET…EX always left a TTL;
  NX would be a silent no-op).
- **Rate limit**: `INCR rl:<ip>:<hourBucket>` (+`EXPIRE … NX 7200`); >30/hour/IP
  → 429. IP = first hop of `x-forwarded-for`. Fails **open** if Redis errors.
  GETs are never limited.
- **Env vars**: `KV_REST_API_URL`+`KV_REST_API_TOKEN` (Vercel Marketplace KV)
  or `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` (direct Upstash).
  Neither set → 503 `{ok:false,error:'unconfigured'}` and the frontend uses
  inline links instead.

### Client degradation ladder

| Condition | Behavior |
|---|---|
| API unreachable / non-JSON (SPA rewrite serves HTML with 200!) / 503 / 500 | Share falls back to inline binary URL |
| Short-ID fetch fails or payload invalid | Recipient shows wilted screen |
| Response HTML masquerading as 200 | Rejected by content-type check before parsing |

## 6. Experience details

- **Share page**: shows "Tying the ribbon…" while storing; copy + native
  Web Share once ready; "Create Another" loops back.
- **Recipient reveal**: sealed ("Someone has a little something…") → button →
  growing scene (stems draw via pathLength stagger, blooms spring in
  depth-order, wrapper ties last; ~2.5 s) → revealed (name headline, NoteCard,
  "Send one back").
- **NoteCard**: Caveat handwriting on grained paper, slight tilt; empty note
  gets a default line in preview contexts.
- **Builder**: steppers cap total at 15; live preview converges (`mode:
  'converge'`) during the 1.6 s creation animation, then navigates.
- **Theme**: light/dark toggle, persisted `localStorage['db-theme']`, synced
  with OS preference at load via inline head script (no FOUC). Dark is its own
  moonlit palette, not an inversion.

## 7. Design system

Tokens defined once in `src/index.css` `@theme` (utilities like `bg-canvas`,
`text-inksoft`, `border-line`, `bg-accentsoft`, `shadow-petal`, `shadow-card`,
`animate-sway`, `animate-breathe`, `font-hand`):

| Token | Light | Dark |
|---|---|---|
| canvas | #fff9f2 | #121a13 |
| canvas-deep | #fbf1e4 | #0d130e |
| card | #fffdf8 | #1b271d |
| ink | #292523 | #efe6d7 |
| inksoft | #8a7d73 | #9aa294 |
| line / line-soft | #eadfce / #f2e9da | #2e3b2c / #26311f |
| accent / soft / deep | #c86b78 / #f6dde2 / #8e3f50 | #cf8d99 / #33202a / #e6b3bc |
| sage / deep | #657a63 / #344936 | #7e947e / #a9bfa7 |

Type: Cormorant Garamond (serif display) · Outfit (sans body) · Caveat (hand-
written notes). Motion signature: slow fades and springs with
`ease: [0.22, 1, 0.36, 1]`; SVG parts animate through nested `<motion.g>`
with `transformBox: 'fill-box'`.

All bouquet art is one coordinate system: 320×400 viewBox, wrapper at bottom,
stems quadratic curves from origin (160,332) to slots; flowers are pure `<g>`
art groups scaled per species (`BLOOM_SIZE`).

## 8. Deployment & environment

- Vercel: static build via `vite build` (`base: './'`), functions auto-detected
  from `api/`. `vercel.json` SPA rewrite serves `index.html` for client routes;
  filesystem (functions) wins over the rewrite for `/api/*`.
- Any other static host: works fully with inline links only (functions absent →
  graceful degradation per §5).
- Storage TTL: entries expire after 365 idle days; every open resets the timer.

## 9. Hard limits (must stay in sync everywhere)

| Limit | Value | Enforced in |
|---|---|---|
| Name length | ≤60 chars | Builder input, sanitizeBouquet, parseBouquet |
| Note length | ≤400 chars | Builder input, sanitizeBouquet, parseBouquet |
| Stems | 6–15 (builder min 6; codec accepts 1–15) | Builder, both validators |
| Flower index | 0–6 | Both validators |
| Wrap index | 0–3 | Both validators |
| Short ID | 7 chars base62 (accept 4–16) | _store.ts, shareApi.ts |
| Slug classification | ≤11 chars ⇒ short ID | isShortId (bouquet.ts) |
| Creations | 30 / hour / IP | api/_store.ts |
| Entry TTL | 365 days, refreshed on read | api/_store.ts |
