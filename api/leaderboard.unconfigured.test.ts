import { describe, it, expect, vi, afterEach } from 'vitest'
import handler from './leaderboard'

function makeRes() {
  const headers: Record<string, string> = {}
  return {
    statusCode: 0,
    body: undefined as any,
    headers,
    setHeader(k: string, v: string) { headers[k] = v },
    status(c: number) { this.statusCode = c; return this },
    json(b: unknown) { this.body = b; return this },
    end() { return this },
  } as any
}

describe('leaderboard without a database configured', ()=>{
  afterEach(()=> vi.unstubAllEnvs())

  it('returns 500 instead of crashing the platform', async ()=>{
    vi.stubEnv('TURSO_DATABASE_URL','')
    const res = makeRes()
    await handler({ method:'GET', query:{ game:'quiz-race' }, headers:{} }, res)
    expect(res.statusCode).toBe(500)
    expect(res.body.reason).toBe('server-error')
  })

  it('returns 500 on submit when the database is unavailable', async ()=>{
    vi.stubEnv('TURSO_DATABASE_URL','')
    const res = makeRes()
    await handler({ method:'POST', body:{ game:'anagram', name:'Ana', correct:3, total:6 }, headers:{} }, res)
    expect(res.statusCode).toBe(500)
    expect(res.body.reason).toBe('server-error')
  })
})