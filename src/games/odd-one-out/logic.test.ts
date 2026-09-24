import { describe,it,expect } from 'vitest'
import { isCorrect } from './logic'
describe('odd-one-out', ()=>{
  it('correct', ()=> expect(isCorrect({answerIndex:2} as any,2)).toBe(true))
  it('wrong', ()=> expect(isCorrect({answerIndex:2} as any,1)).toBe(false))
})
