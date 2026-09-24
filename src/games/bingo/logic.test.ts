import { describe,it,expect } from 'vitest'
import { makeBoard, checkBingo, drawNext } from './logic'
describe('bingo', ()=>{
  it('board size', ()=> expect(makeBoard([{id:'a'} as any,{id:'b'} as any,{id:'c'} as any,{id:'d'} as any,{id:'e'} as any,{id:'f'} as any,{id:'g'} as any,{id:'h'} as any,{id:'i'} as any],3).length).toBe(9))
  it('row bingo', ()=>{ const board=[{id:'1'},{id:'2'},{id:'3'},{id:'4'},{id:'5'},{id:'6'},{id:'7'},{id:'8'},{id:'9'}] as any; expect(checkBingo(board,new Set(['1','2','3']))).toBe(true) })
  it('drawNext not dup', ()=>{ const pool=[{id:'1'},{id:'2'}] as any; const d=new Set(['1']); expect(drawNext(pool,d)?.id).toBe('2') })
})
