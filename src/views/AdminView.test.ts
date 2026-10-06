import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import AdminView from './AdminView.vue'
import * as packsApi from '@/services/packs'
import { PACKS_CACHE_KEY } from '@/stores/packStore'

vi.mock('vue-router', ()=>({ useRouter: ()=> ({ push: vi.fn() }) }))

const SERVER_PACKS = { quiz:[{ id:'q9', question:'From the server?', options:['a','b'], answerIndex:0 }] }

async function mountView() {
  setActivePinia(createPinia())
  const w = mount(AdminView, { global: { stubs:{ RouterLink:true } } })
  await flushPromises()
  return w
}

describe('AdminView pack sync', ()=>{
  beforeEach(()=>{
    localStorage.clear()
    vi.spyOn(packsApi,'fetchPacks').mockResolvedValue({ ok:true, packs:SERVER_PACKS, updatedAt:'2026-01-01 10:00:00' })
    vi.spyOn(packsApi,'savePacks').mockResolvedValue({ ok:true, updatedAt:'2026-01-02 10:00:00', items:1 })
  })
  afterEach(()=> vi.restoreAllMocks())

  it('shows the server copy on load', async ()=>{
    const w = await mountView()
    expect(packsApi.fetchPacks).toHaveBeenCalled()
    expect(w.get('[data-testid="pack-source"]').text()).toContain('Saved on the server')
    expect(w.text()).toContain('2026-01-01 10:00:00')
  })

  it('says when it is running on the offline copy', async ()=>{
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:false, reason:'network-error' })
    localStorage.setItem(PACKS_CACHE_KEY, JSON.stringify({ topics:[{id:'t1', text:'hi'}] }))
    const w = await mountView()
    expect(w.get('[data-testid="pack-source"]').text()).toContain('Offline copy only')
  })

  it('says when nothing is saved yet', async ()=>{
    vi.mocked(packsApi.fetchPacks).mockResolvedValue({ ok:true, packs:{}, updatedAt:null })
    const w = await mountView()
    expect(w.get('[data-testid="pack-source"]').text()).toContain('starter packs')
  })

  it('remembers the admin key on the device', async ()=>{
    const w = await mountView()
    await w.get('[data-testid="admin-key-input"]').setValue('letmein')
    await w.get('[data-testid="admin-key-save"]').trigger('click')
    await flushPromises()
    expect(localStorage.getItem('bbb.admin.key')).toBe('letmein')
    expect(w.get('[data-testid="admin-notice"]').text()).toContain('Admin key saved')
  })

  it('exports the server copy into the textarea', async ()=>{
    const w = await mountView()
    await w.get('[data-testid="export-btn"]').trigger('click')
    await flushPromises()
    const json = JSON.parse((w.get('[data-testid="json-area"]').element as HTMLTextAreaElement).value)
    expect(json.quiz[0].id).toBe('q9')
    expect(w.get('[data-testid="admin-notice"]').text()).toContain('Exported from the server')
  })

  it('imports json to the server', async ()=>{
    const w = await mountView()
    await w.get('[data-testid="admin-key-input"]').setValue('letmein')
    await w.get('[data-testid="admin-key-save"]').trigger('click')
    await w.get('[data-testid="json-area"]').setValue(JSON.stringify({ topics:[{id:'t7', text:'New'}] }))
    await w.get('[data-testid="import-btn"]').trigger('click')
    await flushPromises()

    expect(packsApi.savePacks).toHaveBeenCalledWith({ topics:[{id:'t7', text:'New'}] }, 'letmein')
    expect(w.get('[data-testid="admin-notice"]').text()).toContain('Imported and saved on the server')
    expect(w.text()).toContain('New')
  })

  it('explains a wrong admin key on import', async ()=>{
    vi.mocked(packsApi.savePacks).mockResolvedValue({ ok:false, reason:'admin-wrong' })
    const w = await mountView()
    await w.get('[data-testid="admin-key-input"]').setValue('wrong')
    await w.get('[data-testid="admin-key-save"]').trigger('click')
    await w.get('[data-testid="json-area"]').setValue(JSON.stringify({ topics:[] }))
    await w.get('[data-testid="import-btn"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="admin-notice"]').text()).toContain('not correct')
  })

  it('explains when the server has no admin key configured', async ()=>{
    vi.mocked(packsApi.savePacks).mockResolvedValue({ ok:false, reason:'admin-not-configured' })
    const w = await mountView()
    await w.get('[data-testid="admin-key-input"]').setValue('anything')
    await w.get('[data-testid="admin-key-save"]').trigger('click')
    await w.get('[data-testid="json-area"]').setValue(JSON.stringify({ topics:[] }))
    await w.get('[data-testid="import-btn"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="admin-notice"]').text()).toContain('no ADMIN_KEY set')
  })

  it('reports invalid json without calling the server', async ()=>{
    const w = await mountView()
    await w.get('[data-testid="json-area"]').setValue('{not json')
    await w.get('[data-testid="import-btn"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="admin-notice"]').text()).toBe('Invalid JSON')
    expect(packsApi.savePacks).not.toHaveBeenCalled()
  })

  it('reloads from the server on demand', async ()=>{
    const w = await mountView()
    vi.mocked(packsApi.fetchPacks).mockClear()
    await w.get('[data-testid="pack-reload"]').trigger('click')
    await flushPromises()
    expect(packsApi.fetchPacks).toHaveBeenCalled()
  })

  it('adds an item and pushes it to the server', async ()=>{
    const w = await mountView()
    await w.get('[data-testid="admin-key-input"]').setValue('letmein')
    await w.get('[data-testid="admin-key-save"]').trigger('click')
    await w.find('textarea').setValue(JSON.stringify({ id:'t9', text:'Added live' }))
    await w.findAll('button').find(b=> b.text().includes('Add Item'))!.trigger('click')
    await flushPromises()
    expect(packsApi.savePacks).toHaveBeenCalled()
    const saved = vi.mocked(packsApi.savePacks).mock.calls.at(-1)![0] as any
    expect(saved.topics.map((t:any)=> t.id)).toContain('t9')
  })
})