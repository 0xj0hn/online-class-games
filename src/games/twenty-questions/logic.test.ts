import { describe,it,expect } from 'vitest'
import { makeState, ask, guess, isOver } from './logic'
describe('20q', ()=>{
  it('ask decrements', ()=>{ const s=makeState('CAT',['h1']); ask(s,'is animal?'); expect(s.remaining).toBe(19) })
  it('guess correct', ()=> expect(guess(makeState('CAT',[]),'cat')).toBe(true))
  it('over', ()=>{ const s=makeState('A',[]); s.remaining=0; expect(isOver(s)).toBe(true) })
})
