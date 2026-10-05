import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { usePracticeRound } from './usePracticeRound'

function round(game: 'quiz-race'|'anagram' = 'quiz-race', total = 6) {
  return usePracticeRound(ref(game), ref(total))
}

describe('usePracticeRound', ()=>{
  it('counts correct answers and pays xp', ()=>{
    const r = round()
    r.record(true); r.record(true); r.record(false)
    expect(r.correct.value).toBe(2)
    expect(r.answered.value).toBe(3)
    expect(r.xp.value).toBe(30)
    expect(r.accuracy.value).toBe(67)
  })

  it('tracks current and best streak', ()=>{
    const r = round()
    r.record(true); r.record(true)
    expect(r.streak.value).toBe(2)
    r.record(false)
    expect(r.streak.value).toBe(0)
    expect(r.bestStreak.value).toBe(2)
    r.record(true)
    expect(r.bestStreak.value).toBe(2)
  })

  it('finishes exactly when the round is complete', ()=>{
    const r = round('quiz-race', 3)
    r.record(true); r.record(true)
    expect(r.finished.value).toBe(false)
    r.record(true)
    expect(r.finished.value).toBe(true)
    expect(r.xp.value).toBe(45 + 7)
  })

  it('ignores answers after the round finished', ()=>{
    const r = round('quiz-race', 2)
    r.record(true); r.record(true); r.record(true)
    expect(r.answered.value).toBe(2)
    expect(r.correct.value).toBe(2)
  })

  it('resets back to a clean round', ()=>{
    const r = round()
    r.record(true); r.record(false)
    r.reset()
    expect(r.answered.value).toBe(0)
    expect(r.correct.value).toBe(0)
    expect(r.streak.value).toBe(0)
    expect(r.bestStreak.value).toBe(0)
    expect(r.finished.value).toBe(false)
    expect(r.xp.value).toBe(0)
  })

  it('marks a round submittable only once answered and within bounds', ()=>{
    const r = round('anagram', 6)
    expect(r.submittable.value).toBe(false)
    r.record(true)
    expect(r.submittable.value).toBe(true)
    const tiny = round('anagram', 2)
    tiny.record(true)
    expect(tiny.submittable.value).toBe(false)
  })
})