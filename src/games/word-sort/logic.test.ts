import { describe,it,expect } from 'vitest'
import { checkPlacements } from './logic'
describe('word-sort', ()=>{
  const item={ buckets:['A','B'], words:[{text:'x',bucketIndex:0},{text:'y',bucketIndex:1}]} as any
  it('all correct', ()=> expect(checkPlacements(item,{x:0,y:1})).toEqual({correct:2,total:2}))
  it('one wrong', ()=> expect(checkPlacements(item,{x:1,y:1}).correct).toBe(1))
})
