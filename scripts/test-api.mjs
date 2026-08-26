/**
 * Functional test for the bouquet link-shortening service.
 *
 * Bundles `api/bouquet.ts` and `src/lib/shareApi.ts` with esbuild, points
 * global fetch at an in-memory Upstash-REST-compatible mock, and asserts the
 * full create/fetch/validation/rate-limit/fallback surface. Run: `npm run test:api`.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outDir = mkdtempSync(join(tmpdir(), 'digibouq-test-'))
const bundle = (entry, outfile) =>
  execFileSync(process.execPath.includes('node') ? 'node' : 'node', [
    join('node_modules', 'esbuild', 'bin', 'esbuild'),
    entry,
    '--bundle',
    '--format=esm',
    '--platform=node',
    `--outfile=${join(outDir, outfile)}`,
    '--log-level=silent',
  ])
bundle('api/bouquet.ts', 'api.mjs')
bundle('src/lib/shareApi.ts', 'client.mjs')

// ---------- in-memory Upstash REST mock ----------
const store = new Map() // key -> { value, expireAt }
const now = () => Date.now()

function setEnv(on) {
  if (on) {
    process.env.KV_REST_API_URL = 'https://mock.rest.io'
    process.env.KV_REST_API_TOKEN = 'testtoken'
  } else {
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  }
}
setEnv(true)

function redisPipeline(url, opts = {}) {
  const u = new URL(url)
  if (u.pathname !== '/pipeline') throw new Error('unexpected path ' + u.pathname)
  const auth = opts.headers?.authorization ?? ''
  if (auth !== 'Bearer testtoken') return new Response('unauthorized', { status: 401 })
  const commands = JSON.parse(opts.body)
  const results = commands.map((cmd) => {
    const [op, key] = cmd
    if (op === 'SET') {
      const [, k, value, flag, _ex, ttl] = cmd
      if (flag === 'NX' && store.has(k)) return { result: null }
      store.set(k, { value, expireAt: ttl ? now() + Number(ttl) * 1000 : undefined })
      return { result: 'OK' }
    }
    if (op === 'GET') {
      const e = store.get(key)
      if (!e) return { result: null }
      if (e.expireAt && e.expireAt < now()) {
        store.delete(key)
        return { result: null }
      }
      return { result: e.value }
    }
    if (op === 'EXPIRE') {
      const [, k, ttl, flag] = cmd
      const e = store.get(k)
      if (!e) return { result: 0 }
      if (flag === 'NX' && e.expireAt) return { result: 0 }
      if (flag === 'XX' && !e.expireAt) return { result: 0 }
      e.expireAt = now() + Number(ttl) * 1000
      return { result: 1 }
    }
    if (op === 'INCR') {
      const prev = store.get(key)
      const next = Number(prev?.value ?? 0) + 1
      store.set(key, { value: String(next), expireAt: prev?.expireAt })
      return { result: next }
    }
    return { error: `unknown op ${op}` }
  })
  return new Response(JSON.stringify(results), { status: 200, headers: { 'content-type': 'application/json' } })
}

let handlerDown = false
globalThis.fetch = async (url, opts = {}) => {
  if (handlerDown) return new Response('boom', { status: 500 })
  const path = new URL(url, 'https://app.vercel.app').pathname
  if (path === '/api/bouquet') return handler(new Request('https://app.vercel.app' + url, opts))
  return redisPipeline(url, opts)
}

const { default: handler } = await import(pathToFileURL(join(outDir, 'api.mjs')).href)
const client = await import(pathToFileURL(join(outDir, 'client.mjs')).href)

const post = (body, ip = '1.2.3.4') =>
  handler(
    new Request('https://app.vercel.app/api/bouquet', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }),
  )
const get = (id) => handler(new Request(`https://app.vercel.app/api/bouquet?id=${encodeURIComponent(id)}`))

const validBouquet = {
  v: 1,
  n: 'Navya',
  m: "Wanted to be there for you when you are sick. Get well soon bangaram \u{1F494} Can't wait for our next date",
  w: 2,
  f: [6, 0, 4, 0, 3, 0],
}

// --- unconfigured storage -> 503 + client fallback ---
setEnv(false)
assert.equal((await post(validBouquet)).status, 503, 'POST without storage -> 503')
assert.equal(await client.createShortLink(validBouquet), null, 'client falls back when unconfigured')
setEnv(true)

// --- create + fetch round trip ---
const created = await post(validBouquet)
assert.equal(created.status, 200)
const { ok, id } = await created.json()
assert.equal(ok, true)
assert.match(id, /^[A-Za-z0-9]{7}$/, 'short id shape')

const fetched = await get(id)
assert.equal(fetched.status, 200)
const { bouquet } = await fetched.json()
assert.deepEqual(bouquet, validBouquet, 'round-trip integrity')

// SET used NX + TTL
const entry = [...store.entries()].find(([k]) => k.startsWith('bq:'))
assert.ok(entry[1].expireAt > now(), 'TTL set on create')

// EXPIRE XX refreshes TTL on read
entry[1].expireAt = now() + 5000
await get(id)
assert.ok(entry[1].expireAt > now() + 60_000 * 24, 'TTL refreshed on read')

// --- validation ---
for (const bad of [
  { ...validBouquet, w: 9 }, // wrap out of range
  { ...validBouquet, f: [] }, // no stems
  { ...validBouquet, f: [99] }, // bad flower index
  { ...validBouquet, f: Array(16).fill(0) }, // too many stems
  { ...validBouquet, n: 42 }, // wrong type
  { ...validBouquet, v: 2 }, // unknown version
]) {
  const r = await post(bad)
  assert.notEqual(r.status, 200, `should reject ${JSON.stringify(bad).slice(0, 40)} (got ${r.status})`)
}

// over-long strings are trimmed, not rejected
const capped = await post({ ...validBouquet, n: 'A'.repeat(100), m: 'B'.repeat(500) })
assert.equal(capped.status, 200)

// unknown / invalid ids -> 404 without touching storage
assert.equal((await get('ZZZZZZZ')).status, 404)
assert.equal((await get('../etc')).status, 404)
assert.equal((await get('short')).status, 404)

// method not allowed + malformed body
assert.equal((await handler(new Request('https://x/api/bouquet', { method: 'DELETE' }))).status, 405)
const malformed = new Request('https://x/api/bouquet', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: 'not json',
})
assert.equal((await handler(malformed)).status, 400)

// --- rate limiting: 30/hour per IP ---
store.clear()
let last
for (let i = 0; i < 31; i++) last = await post(validBouquet, '5.5.5.5')
assert.equal(last.status, 429, '31st creation from same IP is rate limited')
assert.equal((await post(validBouquet, '6.6.6.6')).status, 200, 'other IPs unaffected')
const other = await post(validBouquet, '7.7.7.7')
const { id: otherId } = await other.json()
assert.equal((await get(otherId)).status, 200, 'GET is never rate limited')

// --- client helpers ---
const cid = await client.createShortLink(validBouquet)
assert.ok(cid && /^[A-Za-z0-9]{7}$/.test(cid))
assert.deepEqual(await client.fetchSharedBouquet(cid), validBouquet)

// SPA-fallback response (HTML with 200) must not be trusted
handlerDown = false
const realHandlerFetch = globalThis.fetch
globalThis.fetch = async () => new Response('<!doctype html>', { status: 200, headers: { 'content-type': 'text/html' } })
assert.equal(await client.createShortLink(validBouquet), null, 'HTML fallback -> null id (legacy URL used)')
assert.equal(await client.fetchSharedBouquet(cid), null, 'HTML fallback -> null bouquet (wilted screen)')

// tampered stored payload rejected client-side
globalThis.fetch = async () =>
  new Response(JSON.stringify({ ok: true, bouquet: { ...validBouquet, f: [42] } }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
assert.equal(await client.fetchSharedBouquet(cid), null, 'tampered bouquet rejected')

// server failure -> graceful nulls
globalThis.fetch = async () => new Response('boom', { status: 500 })
assert.equal(await client.createShortLink(validBouquet), null)
assert.equal(await client.fetchSharedBouquet(cid), null)

console.log('link-service tests passed')
