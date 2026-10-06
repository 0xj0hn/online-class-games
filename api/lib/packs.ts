import { timingSafeEqual } from 'node:crypto'
import { isPackType } from '../../src/data/packTypes'

export const MAX_PACK_BYTES = 1024 * 1024
export const MAX_TOTAL_ITEMS = 20_000
export const ADMIN_HEADER = 'x-admin-key'

export interface PacksAccepted {
  ok: true
  packs: Record<string, Record<string, unknown>[]>
  bytes: number
  items: number
}

export interface PacksRejected {
  ok: false
  status: number
  reason: string
}

function parseBody(body: unknown): unknown {
  if(typeof body !== 'string') return body
  try { return JSON.parse(body) } catch { return undefined }
}

export function validatePacks(body: unknown): PacksAccepted | PacksRejected {
  const raw = parseBody(body)
  const outer = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw as Record<string, unknown> : null
  const candidate = (outer && typeof outer.packs === 'object' && outer.packs !== null && !Array.isArray(outer.packs))
    ? outer.packs as Record<string, unknown>
    : outer

  if(!candidate) return { ok:false, status:400, reason:'bad-packs' }

  const packs: Record<string, Record<string, unknown>[]> = {}
  let items = 0

  for(const [key, value] of Object.entries(candidate)) {
    if(!isPackType(key)) return { ok:false, status:400, reason:'bad-pack-type' }
    if(!Array.isArray(value)) return { ok:false, status:400, reason:'bad-packs' }

    items += value.length
    if(items > MAX_TOTAL_ITEMS) return { ok:false, status:413, reason:'too-many-items' }

    const clean: Record<string, unknown>[] = []
    for(const item of value) {
      if(!item || typeof item !== 'object' || Array.isArray(item)) return { ok:false, status:400, reason:'bad-item' }
      clean.push(item as Record<string, unknown>)
    }
    packs[key] = clean
  }

  let bytes: number
  try { bytes = Buffer.byteLength(JSON.stringify(packs), 'utf8') }
  catch { return { ok:false, status:400, reason:'bad-packs' } }
  if(bytes > MAX_PACK_BYTES) return { ok:false, status:413, reason:'packs-too-large' }

  return { ok:true, packs, bytes, items }
}

export type KeyResult = 'ok' | 'missing' | 'not-configured' | 'wrong'

export function checkAdminKey(provided: unknown, configured = process.env.ADMIN_KEY): KeyResult {
  if(!configured) return 'not-configured'
  const raw = typeof provided === 'string' ? provided : ''
  if(!raw) return 'missing'
  const given = Buffer.from(raw, 'utf8')
  const want = Buffer.from(configured, 'utf8')
  if(given.length !== want.length) return 'wrong'
  return timingSafeEqual(given, want) ? 'ok' : 'wrong'
}