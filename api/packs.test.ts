import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { exec } = vi.hoisted(()=>({ exec: vi.fn() }))
vi.mock('./lib/db', ()=>({ db: ()=>({ execute: exec }) }))

import handler from './packs'

function makeRes() {
  const headers: Record<string, string> = {}
  return {
    statusCode: 0,
    body: undefined as any,
    headers,
    setHeader(k: string, v: string) { headers[k.toLowerCase()] = v },
    status(c: number) { this.statusCode = c; return this },
    json(b: unknown) { this.body = b; return this },
    end() { return this },
  } as any
}

async function call(req: any) {
  const res = makeRes()
  await handler({ method:'GET', query:{}, headers:{}, body: undefined, ...req }, res)
  return res
}

const VALID = { quiz:[{ id:'q1', question:'x' }] }

describe('packs handler', ()=>{
  beforeEach(()=> exec.mockReset())
  afterEach(()=> { vi.unstubAllEnvs() })

  it('returns an empty pack set before anything is saved', async ()=>{
    exec.mockResolvedValue({ rows:[] })
    const res = await call({})
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ packs:{}, updatedAt:null })
  })

  it('returns the stored packs', async ()=>{
    exec.mockResolvedValue({ rows:[{ data: JSON.stringify(VALID), updated_at:'2026-01-01 10:00:00' }] })
    const res = await call({})
    expect(res.statusCode).toBe(200)
    expect(res.body.packs).toEqual(VALID)
    expect(res.body.updatedAt).toBe('2026-01-01 10:00:00')
  })

  it('survives corrupt stored json', async ()=>{
    exec.mockResolvedValue({ rows:[{ data:'{not json', updated_at:'x' }] })
    const res = await call({})
    expect(res.statusCode).toBe(200)
    expect(res.body.packs).toEqual({})
  })

  it('saves packs with the correct admin key', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    exec.mockResolvedValue({ rows:[{ updated_at:'2026-01-02 09:00:00' }] })
    const res = await call({
      method:'PUT',
      headers:{ 'x-admin-key':'letmein' },
      body:{ packs: VALID },
    })
    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(exec.mock.calls[0][0].args).toEqual([JSON.stringify(VALID)])
  })

  it('accepts a lowercase or uppercase header name', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    exec.mockResolvedValue({ rows:[{ updated_at:'now' }] })
    const res = await call({ method:'PUT', headers:{ 'X-Admin-Key':'letmein' }, body:{ packs: VALID } })
    expect(res.statusCode).toBe(200)
  })

  it('refuses a write with a wrong key', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    const res = await call({ method:'PUT', headers:{ 'x-admin-key':'guess' }, body:{ packs: VALID } })
    expect(res.statusCode).toBe(401)
    expect(res.body.reason).toBe('admin-wrong')
    expect(exec).not.toHaveBeenCalled()
  })

  it('refuses a write with no key', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    const res = await call({ method:'PUT', body:{ packs: VALID } })
    expect(res.statusCode).toBe(401)
    expect(res.body.reason).toBe('admin-missing')
  })

  it('refuses writes when the server has no admin key set', async ()=>{
    vi.stubEnv('ADMIN_KEY','')
    const res = await call({ method:'PUT', headers:{ 'x-admin-key':'anything' }, body:{ packs: VALID } })
    expect(res.statusCode).toBe(503)
    expect(res.body.reason).toBe('admin-not-configured')
  })

  it('rejects invalid packs with the right key', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    const res = await call({ method:'PUT', headers:{ 'x-admin-key':'letmein' }, body:{ packs:{ nope:[] } } })
    expect(res.statusCode).toBe(400)
    expect(res.body.reason).toBe('bad-pack-type')
    expect(exec).not.toHaveBeenCalled()
  })

  it('accepts POST as well as PUT', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    exec.mockResolvedValue({ rows:[{ updated_at:'now' }] })
    const res = await call({ method:'POST', headers:{ 'x-admin-key':'letmein' }, body:{ packs: VALID } })
    expect(res.statusCode).toBe(200)
  })

  it('rejects an unsupported method', async ()=>{
    const res = await call({ method:'DELETE' })
    expect(res.statusCode).toBe(405)
  })

  it('lets anyone read packs without a key', async ()=>{
    vi.stubEnv('ADMIN_KEY','letmein')
    exec.mockResolvedValue({ rows:[] })
    const res = await call({})
    expect(res.statusCode).toBe(200)
  })
})