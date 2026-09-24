import { describe,it,expect } from 'vitest'
import { scramble, checkAnswer } from './logic'
describe('anagram', ()=>{
  it('case insensitive', ()=> expect(checkAnswer('Library','library')).toBe(true))
  it('scramble not equal when len>2', ()=> { const s=scramble('ENGLISH'); expect(s.length).toBe(7) })
})
