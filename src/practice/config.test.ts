import { describe, it, expect } from 'vitest'
import {
  PRACTICE_CONFIGS, PRACTICE_MIN_ROUND, PRACTICE_MAX_ROUND, PRACTICE_MAX_NAME,
  isPracticeGame, roundLengthFor, practiceRoundXp, maxPossibleXp,
  cleanName, sanitizeGame, isValidRound,
} from './config'

describe('practice config', ()=>{
  it('exposes quiz-race and anagram', ()=>{
    expect(isPracticeGame('quiz-race')).toBe(true)
    expect(isPracticeGame('anagram')).toBe(true)
    expect(isPracticeGame('bingo')).toBe(false)
    expect(isPracticeGame('__proto__')).toBe(false)
    expect(isPracticeGame('constructor')).toBe(false)
  })

  it('round is capped by the pool size', ()=>{
    expect(roundLengthFor('quiz-race', 6)).toBe(6)
    expect(roundLengthFor('quiz-race', 40)).toBe(10)
    expect(roundLengthFor('anagram', 3)).toBe(3)
  })
})

describe('practiceRoundXp', ()=>{
  it('pays base xp per correct answer', ()=>{
    expect(practiceRoundXp('quiz-race', 3, 6)).toBe(45)
    expect(practiceRoundXp('anagram', 2, 6)).toBe(20)
  })
  it('adds a flawless bonus only for a perfect round', ()=>{
    expect(practiceRoundXp('quiz-race', 6, 6)).toBe(6*15 + 7)
    expect(practiceRoundXp('quiz-race', 5, 6)).toBe(75)
    expect(practiceRoundXp('anagram', 1, 1)).toBe(10 + 5)
  })
  it('rejects impossible input', ()=>{
    expect(practiceRoundXp('quiz-race', 7, 6)).toBe(0)
    expect(practiceRoundXp('quiz-race', -1, 6)).toBe(0)
    expect(practiceRoundXp('quiz-race', 0, 0)).toBe(0)
  })
  it('bounds a full-length round below the max', ()=>{
    const max = maxPossibleXp('quiz-race')
    expect(practiceRoundXp('quiz-race', PRACTICE_MAX_ROUND, PRACTICE_MAX_ROUND)).toBeLessThanOrEqual(max)
    expect(maxPossibleXp('anagram')).toBeGreaterThan(0)
  })
})

describe('leaderboard input cleaning', ()=>{
  it('trims, strips control chars and caps length', ()=>{
    expect(cleanName('  Ana ')).toBe('Ana')
    expect(cleanName(`Li${String.fromCharCode(7)}sa`)).toBe('Lisa')
    expect(cleanName('x'.repeat(50))).toHaveLength(PRACTICE_MAX_NAME)
  })
  it('rejects junk names', ()=>{
    expect(cleanName('a')).toBeNull()
    expect(cleanName('')).toBeNull()
    expect(cleanName(42)).toBeNull()
    expect(cleanName(null)).toBeNull()
  })
  it('sanitizes game ids', ()=>{
    expect(sanitizeGame('anagram')).toBe('anagram')
    expect(sanitizeGame('nope')).toBeNull()
    expect(sanitizeGame('__proto__')).toBeNull()
  })
  it('validates round bounds', ()=>{
    expect(isValidRound(PRACTICE_MIN_ROUND, PRACTICE_MIN_ROUND)).toBe(true)
    expect(isValidRound(0, PRACTICE_MAX_ROUND)).toBe(true)
    expect(isValidRound(PRACTICE_MAX_ROUND + 1, PRACTICE_MAX_ROUND + 1)).toBe(false)
    expect(isValidRound(1, PRACTICE_MIN_ROUND - 1)).toBe(false)
    expect(isValidRound(4, 3)).toBe(false)
    expect(isValidRound(1.5, 6)).toBe(false)
    expect(isValidRound('2', 6)).toBe(false)
  })
  it('keeps xp values positive in config', ()=>{
    for(const cfg of Object.values(PRACTICE_CONFIGS)) expect(cfg.baseXp).toBeGreaterThan(0)
  })
})