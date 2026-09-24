import { describe, it, expect } from 'vitest'
import { xpFor, streakBonus } from './useScore'
describe('useScore', ()=>{
  it('xpFor fast bonus', ()=> expect(xpFor(true, 15,15,10)).toBe(15))
  it('xpFor slow', ()=> expect(xpFor(true, 0,15,10)).toBe(10))
  it('xpFor half time', ()=> expect(xpFor(true, 7,15,10)).toBe(12))
  it('xpFor wrong 0', ()=> expect(xpFor(false, 15,15,10)).toBe(0))
  it('streakBonus capped', ()=> { expect(streakBonus(1)).toBe(5); expect(streakBonus(3)).toBe(15); expect(streakBonus(10)).toBe(15) })
})
