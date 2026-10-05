import type { PracticeGameId } from '@/practice/config'

export interface LeaderEntry {
  name: string
  xp: number
  correct: number
  total: number
}

export interface SubmitPayload {
  game: PracticeGameId
  name: string
  correct: number
  total: number
}

export interface SubmitResult {
  ok: boolean
  entry?: LeaderEntry
  personalBest?: number
  reason?: string
}

export const SAME_ORIGIN_ALIASES = ['/', 'same-origin', 'same_origin', 'auto']

export function apiBase(): string | null {
  const raw = ((import.meta.env?.VITE_API_URL as string | undefined) ?? '').trim()
  if(!raw) return null
  if(SAME_ORIGIN_ALIASES.includes(raw.toLowerCase())) return ''
  return raw.replace(/\/+$/, '')
}

export function leaderboardEnabled(): boolean {
  return apiBase() !== null
}

async function readJson(res: Response): Promise<any> {
  try { return await res.json() } catch { return null }
}

export async function fetchLeaderboard(game: PracticeGameId, limit = 10): Promise<LeaderEntry[]> {
  const base = apiBase()
  if(base === null) return []
  try {
    const res = await fetch(`${base}/api/leaderboard?game=${encodeURIComponent(game)}&limit=${limit}`)
    if(!res.ok) return []
    const body = await readJson(res)
    const rows = Array.isArray(body?.entries) ? body.entries : []
    return rows
      .filter((r: any)=> r && typeof r.name==='string' && Number.isFinite(Number(r.xp)) )
      .map((r: any)=>({ name:String(r.name), xp:Math.floor(r.xp), correct:Math.floor(r.correct ?? 0), total:Math.floor(r.total ?? 0) }))
      .slice(0, limit)
  } catch { return [] }
}

export async function submitScore(payload: SubmitPayload): Promise<SubmitResult> {
  const base = apiBase()
  if(base === null) return { ok:false, reason:'offline' }
  try {
    const res = await fetch(`${base}/api/leaderboard`, {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await readJson(res)
    if(!res.ok) return { ok:false, reason: typeof body?.reason === 'string' ? body.reason : 'request-failed' }
    return {
      ok:true,
      entry: body?.entry?.name ? { name:String(body.entry.name), xp:Math.floor(body.entry.xp), correct:Math.floor(body.entry.correct ?? 0), total:Math.floor(body.entry.total ?? 0) } : undefined,
      personalBest: Number.isFinite(body?.personalBest) ? Math.floor(body.personalBest) : undefined,
    }
  } catch { return { ok:false, reason:'network-error' } }
}

export const SUBMIT_ERRORS: Record<string, string> = {
  'offline': 'Leaderboard is not configured — your score still counts locally.',
  'network-error': 'Could not reach the leaderboard. Check your connection and try again.',
  'request-failed': 'The leaderboard rejected that score. Try again.',
  'bad-name': 'Please enter your name first.',
  'bad-game': 'That practice game does not exist.',
  'bad-round': 'That round looks invalid.',
  'rate-limited': 'Too many attempts — wait a minute and try again.',
  'server-error': 'The leaderboard had a problem. Try again shortly.',
}