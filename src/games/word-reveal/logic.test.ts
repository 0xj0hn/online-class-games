import { describe, it, expect } from 'vitest'
import { xpForStage, nextStage } from './logic'
describe('reveal', ()=>{
  it('xp decreases with stage', ()=>{
    expect(xpForStage(1)).toBe(20)
    expect(xpForStage(4)).toBe(5)
  })
  it('nextStage caps 4', ()=>{
    expect(nextStage(3)).toBe(4)
    expect(nextStage(4)).toBe(4)
  })
})
