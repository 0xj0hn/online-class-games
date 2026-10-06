import { apiBase } from './leaderboard'

export type PackMap = Record<string, Record<string, unknown>[]>

export interface PacksResponse {
  ok: boolean
  packs?: PackMap
  updatedAt?: string | null
  items?: number
  reason?: string
}

export const PACK_REASONS: Record<string, string> = {
  'offline': 'No server configured — packs stay on this device only.',
  'network-error': 'Could not reach the server.',
  'request-failed': 'The server rejected that request.',
  'bad-packs': 'That JSON is not a valid pack set.',
  'bad-item': 'Some entries are not valid objects.',
  'bad-pack-type': 'Unknown pack name in that JSON.',
  'packs-too-large': 'That JSON is too large to store (1 MB max).',
  'too-many-items': 'That JSON has too many items.',
  'admin-missing': 'Enter your admin key first.',
  'admin-wrong': 'That admin key is not correct.',
  'admin-not-configured': 'The server has no ADMIN_KEY set, so pack saving is disabled.',
  'server-error': 'The server had a problem. Try again shortly.',
}

async function readJson(res: Response): Promise<any> {
  try { return await res.json() } catch { return null }
}

function isPackMap(value: unknown): value is PackMap {
  if(!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).every(v => Array.isArray(v))
}

export async function fetchPacks(): Promise<PacksResponse> {
  const base = apiBase()
  if(base === null) return { ok:false, reason:'offline' }
  try {
    const res = await fetch(`${base}/api/packs`, { headers:{ accept:'application/json' } })
    const body = await readJson(res)
    if(!res.ok) return { ok:false, reason: typeof body?.reason === 'string' ? body.reason : 'request-failed' }
    return isPackMap(body?.packs)
      ? { ok:true, packs:body.packs, updatedAt: body.updatedAt ?? null }
      : { ok:false, reason:'request-failed' }
  } catch { return { ok:false, reason:'network-error' } }
}

export async function savePacks(packs: PackMap, adminKey: string): Promise<PacksResponse> {
  const base = apiBase()
  if(base === null) return { ok:false, reason:'offline' }
  if(!adminKey) return { ok:false, reason:'admin-missing' }
  try {
    const res = await fetch(`${base}/api/packs`, {
      method:'PUT',
      headers:{ 'content-type':'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ packs }),
    })
    const body = await readJson(res)
    if(!res.ok) return { ok:false, reason: typeof body?.reason === 'string' ? body.reason : 'request-failed' }
    return { ok:true, updatedAt: body?.updatedAt ?? null, items: Number(body?.items ?? 0) }
  } catch { return { ok:false, reason:'network-error' } }
}