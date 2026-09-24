import { describe, it, expect } from 'vitest'
import { checkOrder } from './logic'
describe('sentence logic', ()=>{
  it('case-insensitive match', ()=>{
    expect(checkOrder(['She','has'], ['she','HAS'])).toBe(true)
    expect(checkOrder(['She','has'], ['has','She'])).toBe(false)
  })
  it('length mismatch false', ()=> expect(checkOrder(['a'], ['a','b'])).toBe(false))
})
