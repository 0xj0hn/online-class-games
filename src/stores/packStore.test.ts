import { setActivePinia, createPinia } from 'pinia'
import { usePackStore } from './packStore'
import { describe, it, expect, beforeEach } from 'vitest'

describe('packStore', ()=>{
  beforeEach(()=>{ localStorage.clear(); setActivePinia(createPinia()) })
  it('setPack and reset', ()=>{
    const s = usePackStore()
    s.setPack('quiz', [{id:'1'}])
    expect(s.overrides['quiz']).toHaveLength(1)
    s.reset('quiz')
    expect(s.overrides['quiz']).toBeUndefined()
  })
  it('add/update/delete item', ()=>{
    const s = usePackStore()
    const seed = [{id:'a', text:'hi'}]
    s.addItem('topics', {id:'b', text:'bye'}, seed)
    expect(s.overrides['topics']).toHaveLength(2)
    s.updateItem('topics','a',{text:'hello'}, seed)
    expect(s.overrides['topics'].find((x:any)=>x.id==='a').text).toBe('hello')
    s.deleteItem('topics','a', seed)
    expect(s.overrides['topics']).toHaveLength(1)
  })
  it('export/import', ()=>{
    const s = usePackStore()
    s.setPack('quiz', [{id:'x'}])
    const json = s.exportAll()
    localStorage.clear()
    setActivePinia(createPinia())
    const s2 = usePackStore()
    s2.importAll(json)
    expect(s2.overrides['quiz'][0].id).toBe('x')
  })
})
