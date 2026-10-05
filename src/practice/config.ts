export type PracticeGameId = 'quiz-race' | 'anagram'

export interface PracticeConfig {
  id: PracticeGameId
  title: string
  icon: string
  baseXp: number
  seconds: number
  questions: number
}

export const PRACTICE_CONFIGS: Record<PracticeGameId, PracticeConfig> = {
  'quiz-race': { id:'quiz-race', title:'Quiz Race', icon:'⚡', baseXp:15, seconds:15, questions:10 },
  'anagram': { id:'anagram', title:'Anagram', icon:'🔀', baseXp:10, seconds:30, questions:10 },
}

export const PRACTICE_LIST: PracticeConfig[] = [PRACTICE_CONFIGS['quiz-race'], PRACTICE_CONFIGS.anagram]

export const PRACTICE_MIN_ROUND = 3
export const PRACTICE_MAX_ROUND = 25
export const PRACTICE_MAX_NAME = 18

export function isPracticeGame(id: string): id is PracticeGameId {
  return Object.prototype.hasOwnProperty.call(PRACTICE_CONFIGS, id)
}

export function roundLengthFor(game: PracticeGameId | null, poolSize: number): number {
  if(!game) return 0
  return Math.max(1, Math.min(PRACTICE_CONFIGS[game].questions, poolSize))
}

export function practiceRoundXp(game: PracticeGameId | null, correct: number, total: number): number {
  const cfg = game ? PRACTICE_CONFIGS[game] : undefined
  if(!cfg || total<=0 || correct<0 || correct>total) return 0
  const flawless = correct===total ? Math.floor(cfg.baseXp/2) : 0
  return correct * cfg.baseXp + flawless
}

export function maxPossibleXp(game: PracticeGameId | null): number {
  const cfg = game ? PRACTICE_CONFIGS[game] : undefined
  if(!cfg) return 0
  return PRACTICE_MAX_ROUND * cfg.baseXp + Math.floor(cfg.baseXp/2)
}

function isControl(cp: number): boolean {
  return cp < 32 || cp === 127
}

export function cleanName(raw: unknown): string | null {
  if(typeof raw !== 'string') return null
  let out = ''
  for(const ch of raw.trim()) if(!isControl(ch.codePointAt(0)!)) out += ch
  const name = out.trim().slice(0, PRACTICE_MAX_NAME)
  return name.length>=2 ? name : null
}

export function sanitizeGame(raw: unknown): PracticeGameId | null {
  return typeof raw === 'string' && isPracticeGame(raw) ? raw : null
}

export function isValidRound(correct: unknown, total: unknown): boolean {
  if(typeof correct !== 'number' || typeof total !== 'number') return false
  if(!Number.isInteger(correct) || !Number.isInteger(total)) return false
  if(total<PRACTICE_MIN_ROUND || total>PRACTICE_MAX_ROUND) return false
  return correct>=0 && correct<=total
}