import { db } from './lib/db'
import { parseSubmission, parseLimit } from './lib/validate'
import { UPSERT_BEST, SELECT_ONE, SELECT_BOARD } from './lib/queries'
import type { LeaderEntry } from '../src/services/leaderboard'

interface ApiRequest {
  method?: string
  query?: Record<string, string | string[] | undefined>
  headers?: Record<string, unknown>
  body?: unknown
  socket?: { remoteAddress?: string }
}

interface ApiResponse {
  status(code: number): ApiResponse
  json(body: unknown): void
  setHeader(key: string, value: string): void
  end(): void
}

const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 12

function rateLimited(key: string): boolean {
  const now = Date.now()
  const cur = attempts.get(key)
  if(!cur || cur.resetAt <= now) {
    if(attempts.size > 5000) attempts.clear()
    attempts.set(key, { count:1, resetAt: now + WINDOW_MS })
    return false
  }
  cur.count++
  return cur.count > MAX_ATTEMPTS
}

function corsOrigin(req: ApiRequest): string | null {
  const origin = String(req.headers?.origin ?? '')
  const allowed = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if(allowed.includes('*')) return '*'
  if(origin && allowed.includes(origin)) return origin
  return null
}

function applyCors(req: ApiRequest, res: ApiResponse): void {
  const origin = corsOrigin(req)
  if(!origin) return
  res.setHeader('access-control-allow-origin', origin)
  if(origin !== '*') res.setHeader('vary', 'Origin')
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type')
  res.setHeader('access-control-max-age', '86400')
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('cache-control', 'no-store')
  applyCors(req, res)

  try {
    if(req.method === 'OPTIONS') { res.status(204).end(); return }
    if(req.method === 'GET') return await handleGet(req, res)
    if(req.method === 'POST') return await handlePost(req, res)
    res.status(405).json({ reason:'method-not-allowed' })
  } catch (err) {
    console.error('leaderboard error', err)
    res.status(500).json({ reason:'server-error' })
  }
}

async function handleGet(req: ApiRequest, res: ApiResponse) {
  const game = req.query?.game
  const id = Array.isArray(game) ? game[0] : game
  if(typeof id !== 'string' || !id) return res.status(400).json({ reason:'bad-game' })

  const limit = parseLimit(req.query?.limit)
  const result = await db().execute({ sql: SELECT_BOARD, args:[id, limit] })
  const entries: LeaderEntry[] = result.rows.map((r: Record<string, unknown>) => ({
    name: String(r.name),
    xp: Number(r.xp),
    correct: Number(r.correct),
    total: Number(r.total),
  }))
  res.status(200).json({ entries })
}

async function handlePost(req: ApiRequest, res: ApiResponse) {
  const parsed = parseSubmission(req.body)
  if(!parsed.ok) return res.status(parsed.status).json({ reason:parsed.reason })

  const key = `${parsed.game}:${parsed.name}`
  if(rateLimited(key)) return res.status(429).json({ reason:'rate-limited' })

  await db().execute({
    sql: UPSERT_BEST,
    args:[parsed.game, parsed.name, parsed.xp, parsed.correct, parsed.total],
  })

  const mine = await db().execute({ sql: SELECT_ONE, args:[parsed.game, parsed.name] })
  const row = mine.rows[0]

  res.status(200).json({
    entry: {
      name: parsed.name,
      xp: Number(row?.xp ?? parsed.xp),
      correct: Number(row?.correct ?? parsed.correct),
      total: Number(row?.total ?? parsed.total),
    },
    personalBest: Number(row?.xp ?? parsed.xp),
  })
}