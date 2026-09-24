import { describe, it, expect } from 'vitest'
import { pickRandom, calcXpForSpin } from './logic'
describe('spin-wheel logic', ()=>{
  it('pickRandom deterministic with seed', ()=>{
    const arr=[{id:'a'},{id:'b'},{id:'c'}]
    expect(pickRandom(arr,0).id).toBe('a')
    expect(pickRandom(arr,1).id).toBe('b')
    expect(pickRandom(arr,3).id).toBe('a')
  })
  it('throws on empty', ()=> expect(()=> pickRandom([],0)).toThrow())
  it('xp is 10', ()=> expect(calcXpForSpin()).toBe(10))
})
