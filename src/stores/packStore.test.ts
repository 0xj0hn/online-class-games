import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { usePackStore, PACKS_CACHE_KEY } from './packStore'
import * as packsApi from '@/services/packs'

describe('packStore with a server', ()=>{
  beforeEach(()=>{
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(packsApi,'fetchPacks').mockResolvedValue({ ok:true, packs:{ quiz:[{id:'q1'}] }, updatedAt:'2026-01-01 10:00:00' })
    vi.spyOn(packsApi,'savePacks').mockResolvedValue({ ok:true, updatedAt:'2026-01-02 10:00:00', items:1 })
  })
  afterEach(()=> vi.restoreAllMocks())

  it('loads server packs on startup and marks itself ready', async ()=>{
    const s = usePackStore()
    expect(s.source).toBe('seed')
    await s.load()
    expect(s.overrides.quiz).toEqual([{ id:'q1' }])
    expect(s.source).toBe('server')
    expect(s.updatedAt).toBe('2026-01-01 10:00:00')
    expect(s.ready).toBe(true)
  })

  it('caches server packs locally for offline use', async ()=>{
    const s = usePackStore()
    await s.load()
    expect(JSON.parse(localStorage.getItem(PACKS_CACHE_KEY)!).quiz).toEqual([{id:'q1'}])
  })

  it('falls back to the cache when the server is unreachable', async ()=>{
    localStorage.setItem(PACKS_CACHE_KEY, JSON.stringify({ topics:[{id:'t1'}] }))
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:false, reason:'network-error' })
    setActivePinia(createPinia())
    const s = usePackStore()
    await s.load()
    expect(s.overrides.topics).toEqual([{id:'t1'}])
    expect(s.source).toBe('cache')
    expect(s.ready).toBe(true)
  })

  it('uses seed packs when there is nothing anywhere', async ()=>{
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:false, reason:'offline' })
    const s = usePackStore()
    await s.load()
    expect(s.overrides).toEqual({})
    expect(s.source).toBe('seed')
  })

  it('treats an empty server pack set as nothing saved', async ()=>{
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:true, packs:{}, updatedAt:null })
    const s = usePackStore()
    await s.load()
    expect(s.source).toBe('seed')
  })

  it('pushes mutations to the server', async ()=>{
    const s = usePackStore()
    await s.load()
    s.setAdminKey('letmein')
    s.setPack('quiz', [{ id:'q2' }])
    await vi.waitFor(()=> expect(packsApi.savePacks).toHaveBeenCalled())
    expect(packsApi.savePacks).toHaveBeenCalledWith({ quiz:[{id:'q2'}] }, 'letmein')
    expect(s.source).toBe('server')
  })

  it('remembers the admin key on the device', ()=>{
    const s = usePackStore()
    s.setAdminKey('  letmein  ')
    expect(s.adminKey).toBe('letmein')
    setActivePinia(createPinia())
    expect(usePackStore().adminKey).toBe('letmein')
  })

  it('records the last server error without losing local changes', async ()=>{
    const s = usePackStore()
    await s.load()
    s.setAdminKey('wrong')
    vi.mocked(packsApi.savePacks).mockResolvedValue({ ok:false, reason:'admin-wrong' })
    s.setPack('quiz', [{ id:'q9' }])
    await vi.waitFor(()=> expect(s.lastError).toBe('admin-wrong'))
    expect(s.overrides.quiz).toEqual([{id:'q9'}])
  })

  it('does not surface an error when there is simply no server', async ()=>{
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:false, reason:'offline' })
    vi.mocked(packsApi.savePacks).mockResolvedValue({ ok:false, reason:'offline' })
    const s = usePackStore()
    await s.load()
    s.setPack('quiz', [{ id:'q1' }])
    await vi.waitFor(()=> expect(packsApi.savePacks).toHaveBeenCalled())
    expect(s.lastError).toBe('')
  })

  it('round-trips export and import through the server', async ()=>{
    const s = usePackStore()
    await s.load()
    const json = s.exportAll()
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:false, reason:'network-error' })
    setActivePinia(createPinia())
    const s2 = usePackStore()
    s2.setAdminKey('letmein')
    await s2.importAll(json)
    expect(s2.overrides.quiz).toEqual([{id:'q1'}])
    expect(packsApi.savePacks).toHaveBeenCalledWith({ quiz:[{id:'q1'}] }, 'letmein')
  })

  it('rejects invalid json on import and does not touch the server', async ()=>{
    const s = usePackStore()
    s.setAdminKey('letmein')
    expect(()=> s.importAll('{not json')).toThrow()
    expect(packsApi.savePacks).not.toHaveBeenCalled()
  })

  it('ignores legacy local packs from the old storage key', async ()=>{
    localStorage.setItem('bbb_packs_v1', JSON.stringify({ quiz:[{id:'legacy'}] }))
    setActivePinia(createPinia())
    const s = usePackStore()
    expect(s.overrides).toEqual({})
  })

  it('resets and clears the cache', async ()=>{
    const s = usePackStore()
    await s.load()
    s.reset('quiz')
    expect(s.overrides.quiz).toBeUndefined()
    expect(JSON.parse(localStorage.getItem(PACKS_CACHE_KEY)!)).toEqual({})
    s.setPack('quiz', [{id:'x'}])
    s.reset()
    expect(s.overrides).toEqual({})
  })

  it('still supports add/update/delete against seeds', async ()=>{
    const s = usePackStore()
    const seed = [{id:'a', text:'hi'}]
    s.addItem('topics', {id:'b', text:'bye'}, seed)
    expect(s.overrides.topics).toHaveLength(2)
    s.updateItem('topics','a',{text:'hello'}, seed)
    expect(s.overrides.topics.find((x:any)=>x.id==='a').text).toBe('hello')
    s.deleteItem('topics','a', seed)
    expect(s.overrides.topics).toHaveLength(1)
  })
})