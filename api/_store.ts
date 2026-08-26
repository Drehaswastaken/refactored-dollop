/**
 * Shared server-side helpers for the bouquet link-shortening service.
 *
 * Storage: any Upstash-compatible Redis REST endpoint. Works with either
 *   - Vercel KV  -> KV_REST_API_URL / KV_REST_API_TOKEN
 *   - Upstash    -> UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * If none are configured the API reports `unconfigured` and the frontend
 * gracefully falls back to self-contained (long) links.
 */

declare const process: { env: Record<string, string | undefined> }

export interface StoredBouquet {
  v: number
  n: string
  m: string
  w: number
  f: number[]
}

const NAME_MAX = 60
const MSG_MAX = 400
export const WRAP_STYLE_COUNT = 4
export const FLOWER_TYPE_COUNT = 7
export const MAX_STEMS = 15

const TTL_SECONDS = 60 * 60 * 24 * 365 // 1 year, refreshed on every open
const RATE_LIMIT_PER_HOUR = 30
const ID_LENGTH = 7
const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const KEY_PREFIX = 'bq:'

function restConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/+$/, ''), token }
}

export function storageConfigured(): boolean {
  return restConfig() !== null
}

/** Runs a pipeline of Redis commands over the REST API; null on transport failure. */
async function redis(commands: string[][]): Promise<{ result?: unknown; error?: string }[] | null> {
  const cfg = restConfig()
  if (!cfg) return null
  try {
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${cfg.token}`, 'content-type': 'application/json' },
      body: JSON.stringify(commands),
    })
    if (!res.ok) return null
    return (await res.json()) as { result?: unknown; error?: string }[]
  } catch {
    return null
  }
}

function randomId(): string {
  const bytes = new Uint8Array(ID_LENGTH)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  let id = ''
  for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length]
  return id
}

export function isValidId(id: string): boolean {
  return /^[A-Za-z0-9]{4,16}$/.test(id)
}

/** Validates an untrusted payload into a canonical, size-capped bouquet. */
export function sanitizeBouquet(input: unknown): StoredBouquet | null {
  if (typeof input !== 'object' || input === null) return null
  const raw = input as Record<string, unknown>

  if (raw.v !== 1) return null
  if (typeof raw.n !== 'string' || typeof raw.m !== 'string') return null
  if (!Number.isInteger(raw.w) || (raw.w as number) < 0 || (raw.w as number) >= WRAP_STYLE_COUNT) return null

  if (!Array.isArray(raw.f) || raw.f.length < 1 || raw.f.length > MAX_STEMS) return null
  for (const t of raw.f) {
    if (!Number.isInteger(t) || (t as number) < 0 || (t as number) >= FLOWER_TYPE_COUNT) return null
  }

  const n = (raw.n as string).trim().slice(0, NAME_MAX)
  const m = (raw.m as string).trim().slice(0, MSG_MAX)

  return { v: 1, n, m, w: raw.w as number, f: raw.f as number[] }
}

/** Creates the bouquet under a fresh short ID. Returns null if storage fails. */
export async function storeBouquet(bouquet: StoredBouquet): Promise<string | null> {
  const value = JSON.stringify(bouquet)
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = randomId()
    const res = await redis([['SET', KEY_PREFIX + id, value, 'NX', 'EX', String(TTL_SECONDS)]])
    if (!res || res.length !== 1 || res[0].error !== undefined) return null
    if (res[0].result === 'OK') return id // null result means the ID collided; retry
  }
  return null
}

/** Loads a bouquet by short ID and refreshes its TTL so loved bouquets persist. */
export async function loadBouquet(id: string): Promise<StoredBouquet | null> {
  if (!isValidId(id)) return null
  const key = KEY_PREFIX + id
  const res = await redis([
    ['GET', key],
    // XX: the key always has a TTL from SET…EX, so re-asserting extends it
    ['EXPIRE', key, String(TTL_SECONDS), 'XX'],
  ])
  if (!res || res.length !== 2 || typeof res[0].result !== 'string') return null
  try {
    const parsed: unknown = JSON.parse(res[0].result)
    return sanitizeBouquet(parsed)
  } catch {
    return null
  }
}

/** Simple per-IP hourly rate limit to protect the free Redis tier. */
export async function allowRequest(ip: string): Promise<boolean> {
  const bucket = Math.floor(Date.now() / 3_600_000)
  const key = `rl:${ip || 'unknown'}:${bucket}`
  const res = await redis([
    ['INCR', key],
    ['EXPIRE', key, '7200', 'NX'],
  ])
  if (!res || res.length !== 2) return true // fail open rather than block sharing
  const count = res[0].result
  return typeof count === 'number' && count <= RATE_LIMIT_PER_HOUR
}
