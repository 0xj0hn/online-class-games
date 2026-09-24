import { describe, it, expect } from 'vitest'
import { checkAnswer, xpForQuiz } from './logic'
describe('quiz logic', ()=>{
  it('check answer', ()=>{
    const item={ id:'q1', category:'G', question:'?', options:['a','b'], answerIndex:1 } as any
    expect(checkAnswer(item,1)).toBe(true)
    expect(checkAnswer(item,0)).toBe(false)
  })
  it('xp', ()=>{ expect(xpForQuiz(true)).toBe(15); expect(xpForQuiz(false)).toBe(0) })
})
