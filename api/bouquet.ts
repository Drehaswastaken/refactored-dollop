import { allowRequest, isValidId, loadBouquet, sanitizeBouquet, storageConfigured, storeBouquet } from './_store'

const JSON_HEADERS = { 'content-type': 'application/json' }

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const id = url.searchParams.get('id') ?? ''
    if (!isValidId(id)) return json({ ok: false, error: 'not_found' }, 404)
    if (!storageConfigured()) return json({ ok: false, error: 'unconfigured' }, 503)
    const bouquet = await loadBouquet(id)
    if (!bouquet) return json({ ok: false, error: 'not_found' }, 404)
    return json({ ok: true, bouquet }, 200)
  }

  if (req.method === 'POST') {
    if (!storageConfigured()) return json({ ok: false, error: 'unconfigured' }, 503)

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
    if (!(await allowRequest(ip))) return json({ ok: false, error: 'rate_limited' }, 429)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return json({ ok: false, error: 'invalid' }, 400)
    }

    const bouquet = sanitizeBouquet(body)
    if (!bouquet) return json({ ok: false, error: 'invalid' }, 400)

    const id = await storeBouquet(bouquet)
    if (!id) return json({ ok: false, error: 'storage_failed' }, 502)

    return json({ ok: true, id }, 200)
  }

  return json({ ok: false, error: 'method_not_allowed' }, 405)
}
