import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { exec } = vi.hoisted(()=>({ exec: vi.fn() }))
vi.mock('./lib/db', ()=>({ db: ()=>({ execute: exec }) }))

import handler from './leaderboard'

interface FakeRes {
  statusCode: number
  body: any
  headers: Record<string, string>
  ended: boolean
}

function makeRes(): FakeRes & any {
  const headers: Record<string, string> = {}
  return {
    statusCode: 0,
    body: undefined,
    headers,
    ended: false,
    setHeader(k: string, v: string) { headers[k.toLowerCase()] = v },
    status(c: number) { this.statusCode = c; return this },
    json(b: unknown) { this.body = b; return this },
    end() { this.ended = true; return this },
  }
}

function makeReq(over: any = {}) {
  return { method:'GET', query:{}, headers:{}, body: undefined, ...over }
}

async function call(req: any) {
  const res = makeRes()
  await handler(makeReq(req), res)
  return res
}

describe('leaderboard handler', ()=>{
  beforeEach(()=> exec.mockReset())
  afterEach(()=> vi.unstubAllEnvs())

  it('answers a GET with board entries', async ()=>{
    exec.mockResolvedValue({ rows:[
      { name:'Ana', xp:97, correct:6, total:6 },
      { name:'Kai', xp:45, correct:3, total:6 },
    ] })
    const res = await call({ query:{ game:'quiz-race', limit:'10' } })
    expect(res.statusCode).toBe(200)
    expect(res.body.entries).toEqual([
      { name:'Ana', xp:97, correct:6, total:6 },
      { name:'Kai', xp:45, correct:3, total:6 },
    ])
    expect(exec.mock.calls[0][0].args).toEqual(['quiz-race', 10])
  })

  it('rejects a GET with no game', async ()=>{
    const res = await call({ query:{} })
    expect(res.statusCode).toBe(400)
    expect(res.body.reason).toBe('bad-game')
    expect(exec).not.toHaveBeenCalled()
  })

  it('scores a POST on the server and ignores client xp', async ()=>{
    exec.mockResolvedValueOnce({ rows:[] }).mockResolvedValueOnce({ rows:[{ xp:75, correct:5, total:6 }] })
    const res = await call({
      method:'POST',
      body:{ game:'quiz-race', name:'Ana', correct:5, total:6, xp:999999 },
    })
    expect(res.statusCode).toBe(200)
    expect(res.body.personalBest).toBe(75)
    const write = exec.mock.calls[0][0]
    expect(write.args).toEqual(['quiz-race', 'Ana', 75, 5, 6])
    expect(JSON.stringify(write)).not.toContain('999999')
  })

  it('rejects an invalid submission', async ()=>{
    const res = await call({ method:'POST', body:{ game:'bingo', name:'Ana', correct:3, total:6 } })
    expect(res.statusCode).toBe(400)
    expect(res.body.reason).toBe('bad-game')
    expect(exec).not.toHaveBeenCalled()
  })

  it('answers an OPTIONS preflight without touching the db', async ()=>{
    const res = await call({ method:'OPTIONS' })
    expect(res.statusCode).toBe(204)
    expect(res.ended).toBe(true)
    expect(res.headers['access-control-allow-methods']).toContain('POST')
    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(exec).not.toHaveBeenCalled()
  })

  it('rejects an unsupported method', async ()=>{
    const res = await call({ method:'DELETE' })
    expect(res.statusCode).toBe(405)
    expect(exec).not.toHaveBeenCalled()
  })

  it('allows every origin by default', async ()=>{
    exec.mockResolvedValue({ rows:[] })
    const res = await call({ headers:{ origin:'https://anywhere.example' }, query:{ game:'quiz-race' } })
    expect(res.headers['access-control-allow-origin']).toBe('*')
  })

  it('restricts origins when ALLOWED_ORIGINS is set', async ()=>{
    vi.stubEnv('ALLOWED_ORIGINS','https://classroom.example,https://other.example')
    exec.mockResolvedValue({ rows:[] })

    const ok = await call({ headers:{ origin:'https://classroom.example' }, query:{ game:'quiz-race' } })
    expect(ok.headers['access-control-allow-origin']).toBe('https://classroom.example')
    expect(ok.headers['vary']).toBe('Origin')

    const no = await call({ headers:{ origin:'https://evil.example' }, query:{ game:'quiz-race' } })
    expect(no.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('rate-limits a single student', async ()=>{
    exec.mockResolvedValue({ rows:[] })
    let last: any
    for(let i=0; i<13; i++) {
      last = await call({ method:'POST', body:{ game:'anagram', name:'Rater', correct:1, total:6 } })
    }
    expect(last.statusCode).toBe(429)
    expect(last.body.reason).toBe('rate-limited')
    expect(exec.mock.calls.length).toBe(12 * 2)
  })
})
