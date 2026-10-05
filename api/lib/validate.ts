import {
  cleanName, sanitizeGame, isValidRound, practiceRoundXp,
  type PracticeGameId,
} from '../../src/practice/config'

export interface Accepted {
  ok: true
  game: PracticeGameId
  name: string
  correct: number
  total: number
  xp: number
}

export interface Rejected {
  ok: false
  status: number
  reason: string
}

export function parseSubmission(body: unknown): Accepted | Rejected {
  const raw = (typeof body === 'string' ? safeParse(body) : body) as Record<string, unknown> | null
  if(!raw || typeof raw !== 'object') return { ok:false, status:400, reason:'bad-request' }

  const game = sanitizeGame(raw.game)
  if(!game) return { ok:false, status:400, reason:'bad-game' }

  const name = cleanName(raw.name)
  if(!name) return { ok:false, status:400, reason:'bad-name' }

  if(!isValidRound(raw.correct, raw.total)) return { ok:false, status:400, reason:'bad-round' }

  const correct = raw.correct as number
  const total = raw.total as number
  return { ok:true, game, name, correct, total, xp: practiceRoundXp(game, correct, total) }
}

function safeParse(json: string): unknown {
  try { return JSON.parse(json) } catch { return null }
}

export function parseLimit(raw: unknown, fallback = 10): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  if(!Number.isInteger(n)) return fallback
  return Math.min(25, Math.max(1, n))
}