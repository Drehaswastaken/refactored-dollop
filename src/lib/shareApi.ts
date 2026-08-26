import {
  MAX_STEMS,
  WRAP_STYLES,
  isShortId,
  type BouquetData,
} from './bouquet'

/**
 * Client helpers for the link-shortening service (`/api/bouquet`).
 * Every call degrades gracefully: on any failure the app falls back to
 * self-contained (longer) links, so sharing never breaks.
 */

function parseBouquet(json: unknown): BouquetData | null {
  if (typeof json !== 'object' || json === null) return null
  const raw = json as Record<string, unknown>
  if (raw.v !== 1) return null
  if (typeof raw.n !== 'string' || typeof raw.m !== 'string') return null
  if (!Number.isInteger(raw.w) || (raw.w as number) < 0 || (raw.w as number) >= WRAP_STYLES.length) return null
  if (!Array.isArray(raw.f) || raw.f.length < 1 || raw.f.length > MAX_STEMS) return null
  if (!raw.f.every((t) => Number.isInteger(t) && t >= 0 && t < 7)) return null
  return { v: 1, n: raw.n as string, m: raw.m as string, w: raw.w as number, f: raw.f as number[] }
}

async function readJson(res: Response): Promise<unknown> {
  if (!res.ok) return null
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) return null // SPA fallback served HTML instead
  try {
    return await res.json()
  } catch {
    return null
  }
}

/** Stores the bouquet and returns a short ID, or null if unavailable. */
export async function createShortLink(data: BouquetData, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch('/api/bouquet', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ v: data.v, n: data.n, m: data.m, w: data.w, f: data.f }),
      signal,
    })
    const json = await readJson(res)
    if (typeof json !== 'object' || json === null) return null
    const id = (json as Record<string, unknown>).id
    return typeof id === 'string' && isShortId(id) ? id : null
  } catch {
    return null
  }
}

/** Loads a bouquet that was stored server-side. */
export async function fetchSharedBouquet(id: string): Promise<BouquetData | null> {
  try {
    const res = await fetch(`/api/bouquet?id=${encodeURIComponent(id)}`)
    const json = await readJson(res)
    if (typeof json !== 'object' || json === null) return null
    return parseBouquet((json as Record<string, unknown>).bouquet)
  } catch {
    return null
  }
}
