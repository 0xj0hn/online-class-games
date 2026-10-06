import { db } from './lib/db'
import { SELECT_PACKS, UPSERT_PACKS } from './lib/queries'
import { validatePacks, checkAdminKey, ADMIN_HEADER, type KeyResult } from './lib/packs'

interface ApiRequest {
  method?: string
  query?: Record<string, string | string[] | undefined>
  headers?: Record<string, unknown>
  body?: unknown
}

interface ApiResponse {
  status(code: number): ApiResponse
  json(body: unknown): void
  setHeader(key: string, value: string): void
  end(): void
}

function headerValue(req: ApiRequest, name: string): unknown {
  const headers = req.headers ?? {}
  const key = Object.keys(headers).find(k => k.toLowerCase() === name)
  return key ? headers[key] : undefined
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('cache-control', 'no-store')

  try {
    if(req.method === 'GET') return await handleGet(res)
    if(req.method === 'PUT' || req.method === 'POST') return await handlePut(req, res)
    res.status(405).json({ reason:'method-not-allowed' })
  } catch (err) {
    console.error('packs error', err)
    res.status(500).json({ reason:'server-error' })
  }
}

async function handleGet(res: ApiResponse) {
  const row = await db().execute({ sql: SELECT_PACKS, args:[] })
  const found = row.rows[0]
  if(!found) return res.status(200).json({ packs:{}, updatedAt:null })

  let packs: unknown = {}
  try { packs = JSON.parse(String(found.data)) } catch { packs = {} }
  res.status(200).json({ packs, updatedAt: String(found.updated_at ?? '') })
}

async function handlePut(req: ApiRequest, res: ApiResponse) {
  const verdict: KeyResult = checkAdminKey(headerValue(req, ADMIN_HEADER))
  if(verdict !== 'ok') {
    return res.status(verdict === 'not-configured' ? 503 : 401).json({ reason:`admin-${verdict}` })
  }

  const validated = validatePacks(req.body)
  if(!validated.ok) return res.status(validated.status).json({ reason:validated.reason })

  const saved = await db().execute({
    sql: UPSERT_PACKS,
    args:[JSON.stringify(validated.packs)],
  })
  res.status(200).json({ ok:true, items:validated.items, updatedAt:String(saved.rows[0]?.updated_at ?? '') })
}