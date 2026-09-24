import { setActivePinia, createPinia } from 'pinia'
import { useTeamStore } from './teamStore'
import { describe, it, expect, beforeEach } from 'vitest'
describe('teamStore', ()=>{
  beforeEach(()=> setActivePinia(createPinia()))
  it('addScore and nextTurn', ()=>{
    const s = useTeamStore()
    const first = s.teams[0].id
    s.addScore(first, 10)
    expect(s.teams[0].score).toBe(10)
    const activeBefore=s.activeId
    s.nextTurn()
    expect(s.activeId).not.toBe(activeBefore)
  })
})
