import { describe, it, expect } from 'vitest'
import { makeCards, isMatch } from './logic'
describe('memory logic', ()=>{
  it('makes 2x cards', ()=>{
    const cards=makeCards([{id:'p1', en:'apple', definition:'fruit'}])
    expect(cards).toHaveLength(2)
  })
  it('isMatch correct', ()=>{
    expect(isMatch({uid:'a-w', pairId:'a', label:'x', type:'word'} as any, {uid:'a-d', pairId:'a', label:'y', type:'def'} as any)).toBe(true)
    expect(isMatch({uid:'a-w', pairId:'a', label:'x', type:'word'} as any, {uid:'b-d', pairId:'b', label:'y', type:'def'} as any)).toBe(false)
  })
})
