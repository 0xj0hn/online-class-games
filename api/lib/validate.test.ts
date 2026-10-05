import { describe, it, expect } from 'vitest'
import { parseSubmission, parseLimit } from './validate'

describe('parseSubmission', ()=>{
  it('accepts a normal round and scores it server-side', ()=>{
    const res = parseSubmission({ game:'quiz-race', name:'Ana', correct:5, total:6 })
    expect(res).toEqual({ ok:true, game:'quiz-race', name:'Ana', correct:5, total:6, xp:75 })
  })

  it('ignores a client-supplied xp field', ()=>{
    const res = parseSubmission({ game:'anagram', name:'Ana', correct:6, total:6, xp:999999 })
    expect(res.ok).toBe(true)
    if(res.ok) expect(res.xp).toBe(60 + 5)
  })

  it('parses a json string body', ()=>{
    const res = parseSubmission(JSON.stringify({ game:'anagram', name:'Kai', correct:3, total:6 }))
    expect(res.ok).toBe(true)
    if(res.ok) expect(res.xp).toBe(30)
  })

  it('rejects an unknown game', ()=>{
    expect(parseSubmission({ game:'bingo', name:'Ana', correct:3, total:6 }))
      .toEqual({ ok:false, status:400, reason:'bad-game' })
    expect(parseSubmission({ game:'__proto__', name:'Ana', correct:3, total:6 }).ok).toBe(false)
  })

  it('rejects a bad name', ()=>{
    expect(parseSubmission({ game:'quiz-race', name:'  ', correct:3, total:6 }).ok).toBe(false)
    expect(parseSubmission({ game:'quiz-race', correct:3, total:6 }).ok).toBe(false)
    expect(parseSubmission({ game:'quiz-race', name:'Ana', correct:3, total:6 }).ok).toBe(true)
  })

  it('rejects impossible rounds', ()=>{
    const bad = [
      { correct:7, total:6 },
      { correct:-1, total:6 },
      { correct:1, total:1 },
      { correct:1, total:99 },
      { correct:1.5, total:6 },
      { correct:'5', total:6 },
      { total:6 },
    ]
    for(const b of bad) {
      const res = parseSubmission({ game:'quiz-race', name:'Ana', ...b })
      expect(res.ok, JSON.stringify(b)).toBe(false)
    }
  })

  it('rejects junk bodies', ()=>{
    for(const body of [null, undefined, 'not json', 42, []]) {
      const res = parseSubmission(body)
      expect(res.ok).toBe(false)
    }
  })
})

describe('parseLimit', ()=>{
  it('clamps to a sane range', ()=>{
    expect(parseLimit('10')).toBe(10)
    expect(parseLimit('0')).toBe(1)
    expect(parseLimit('999')).toBe(25)
    expect(parseLimit(['7'])).toBe(7)
  })
  it('falls back on junk', ()=>{
    expect(parseLimit(undefined)).toBe(10)
    expect(parseLimit('abc')).toBe(10)
  })
})