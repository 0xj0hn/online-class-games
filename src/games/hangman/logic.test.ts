import { describe, it, expect } from 'vitest'
import { makeState, guess, isWon, isLost, displayWord } from './logic'
describe('hangman', ()=>{
  it('guess correct keeps lives', ()=>{
    const s=makeState('APPLE')
    guess(s,'A')
    expect(s.lives).toBe(6)
    expect(displayWord(s)).toContain('A')
  })
  it('wrong reduces lives', ()=>{
    const s=makeState('APPLE')
    guess(s,'Z')
    expect(s.lives).toBe(5)
  })
  it('won when all guessed', ()=>{
    const s=makeState('HI')
    guess(s,'H'); guess(s,'I')
    expect(isWon(s)).toBe(true)
  })
  it('lost when lives 0', ()=>{
    const s=makeState('HI')
    for(const c of ['A','B','C','D','E','F']) guess(s,c)
    expect(isLost(s)).toBe(true)
  })
  it('duplicate guess ignored', ()=>{
    const s=makeState('HI')
    guess(s,'Z'); const lives=s.lives
    guess(s,'Z')
    expect(s.lives).toBe(lives)
  })
})
