import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPacks, savePacks, PACK_REASONS } from './packs'

function jsonResponse(body: unknown, status = 200) {
  return { ok: status>=200 && status<300, status, json: async ()=> body } as unknown as Response
}

const PACKS = { quiz:[{ id:'q1' }] }

describe('packs client', ()=>{
  beforeEach(()=> vi.stubGlobal('fetch', vi.fn()))
  afterEach(()=> { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

  it('is offline when no api url is set', async ()=>{
    vi.stubEnv('VITE_API_URL','')
    expect((await fetchPacks()).reason).toBe('offline')
    expect((await savePacks(PACKS, 'k')).reason).toBe('offline')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('loads packs from the server', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ packs: PACKS, updatedAt:'2026-01-01 10:00:00' }))
    const res = await fetchPacks()
    expect(res.ok).toBe(true)
    expect(res.packs).toEqual(PACKS)
    expect(res.updatedAt).toBe('2026-01-01 10:00:00')
    expect(fetch).toHaveBeenCalledWith('/api/packs', { headers:{ accept:'application/json' } })
  })

  it('rejects a malformed payload instead of trusting it', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    for(const body of [{}, { packs:'nope' }, { packs:{ quiz:'nope' } }, null]) {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(body))
      expect((await fetchPacks()).ok, JSON.stringify(body)).toBe(false)
    }
  })

  it('surfaces a server reason on load', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ reason:'server-error' }, 500))
    expect((await fetchPacks()).reason).toBe('server-error')
  })

  it('never calls save without a key', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    expect((await savePacks(PACKS, '')).reason).toBe('admin-missing')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('saves packs with the key header', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok:true, items:1, updatedAt:'now' }))
    const res = await savePacks(PACKS, 'letmein')
    expect(res.ok).toBe(true)
    expect(res.items).toBe(1)
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init as any).method).toBe('PUT')
    expect((init as any).headers['x-admin-key']).toBe('letmein')
    expect(JSON.parse((init as any).body)).toEqual({ packs: PACKS })
  })

  it('maps rejection reasons to friendly copy', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    for(const reason of ['admin-wrong','admin-missing','admin-not-configured','packs-too-large','too-many-items','bad-pack-type']) {
      vi.mocked(fetch).mockResolvedValue(jsonResponse({ reason }, 400))
      const res = await savePacks(PACKS, 'k')
      expect(res.reason).toBe(reason)
      expect(PACK_REASONS[reason], reason).toBeTruthy()
    }
  })

  it('handles network failures', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    expect((await fetchPacks()).reason).toBe('network-error')
    expect((await savePacks(PACKS, 'k')).reason).toBe('network-error')
  })
})