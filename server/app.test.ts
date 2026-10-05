import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { migrate } from './migrate'

const dir = mkdtempSync(join(tmpdir(), 'bbb-server-'))
const dist = join(dir, 'dist')
mkdirSync(join(dist, 'assets'), { recursive:true })
writeFileSync(join(dist, 'index.html'), '<!doctype html><title>BBB</title><div id=app></div>')
writeFileSync(join(dist, 'assets', 'index-abc.js'), 'console.log(1)')
writeFileSync(join(dist, 'secret.txt'), 'nope')

process.env.TURSO_DATABASE_URL = `file:${join(dir, 'db.sqlite')}`
process.env.ALLOWED_ORIGINS = '*'

const { createRequestListener } = await import('./app')
let server: Server
let base = ''

beforeAll(async ()=>{
  await migrate()
  server = createServer(createRequestListener({ distDir: dist }))
  await new Promise<void>(r=> server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async ()=>{
  await new Promise<void>(r=> server.close(()=> r()))
  rmSync(dir, { recursive:true, force:true })
})

describe('self-hosted server', ()=>{
  it('serves the built SPA', async ()=>{
    const res = await fetch(`${base}/`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(await res.text()).toContain('id=app')
    expect(res.headers.get('cache-control')).toBe('no-cache')
  })

  it('serves hashed assets immutably', async ()=>{
    const res = await fetch(`${base}/assets/index-abc.js`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/javascript')
    expect(res.headers.get('cache-control')).toContain('immutable')
  })

  it('falls back to index.html for client routes', async ()=>{
    const res = await fetch(`${base}/practice/quiz-race`)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('id=app')
  })

  it('refuses path traversal out of dist', async ()=>{
    const res = await fetch(`${base}/../package.json`)
    expect(await res.text()).not.toContain('"name": "onlinebigbluebuttongame"')
  })

  it('serves the real asset when it exists', async ()=>{
    const res = await fetch(`${base}/secret.txt`)
    expect(await res.text()).toBe('nope')
  })

  it('reports health with the database reachable', async ()=>{
    const res = await fetch(`${base}/api/health`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok:true })
  })

  it('404s an unknown api route', async ()=>{
    const res = await fetch(`${base}/api/nope`)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ reason:'not-found' })
  })

  it('reads the leaderboard over http', async ()=>{
    const res = await fetch(`${base}/api/leaderboard?game=quiz-race&limit=5`)
    expect(res.status).toBe(200)
    expect((await res.json() as any).entries).toEqual([])
  })

  it('stores a score and keeps the personal best', async ()=>{
    const post = (correct:number)=> fetch(`${base}/api/leaderboard`, {
      method:'POST', headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ game:'quiz-race', name:'Ana', correct, total:6 }),
    })

    const first = await post(3)
    expect(first.status).toBe(200)
    expect((await first.json() as any).personalBest).toBe(45)

    const better = await post(6)
    expect((await better.json() as any).personalBest).toBe(97)

    const worse = await post(1)
    expect((await worse.json() as any).personalBest).toBe(97)

    const board = await fetch(`${base}/api/leaderboard?game=quiz-race`)
    const { entries } = await board.json() as any
    expect(entries).toEqual([{ name:'Ana', xp:97, correct:6, total:6 }])
  })

  it('rejects an oversized body', async ()=>{
    const res = await fetch(`${base}/api/leaderboard`, {
      method:'POST', headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ game:'quiz-race', name:'Bob', correct:1, total:6, pad:'x'.repeat(20000) }),
    })
    expect(res.status).toBe(413)
  })

  it('rejects a forged score', async ()=>{
    const res = await fetch(`${base}/api/leaderboard`, {
      method:'POST', headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ game:'quiz-race', name:'Mallory', correct:6, total:6, xp:999999 }),
    })
    expect((await res.json() as any).entry.xp).toBe(97)
  })

  it('answers a cors preflight', async ()=>{
    const res = await fetch(`${base}/api/leaderboard`, { method:'OPTIONS' })
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('does not let a bad body crash the process', async ()=>{
    const res = await fetch(`${base}/api/leaderboard`, {
      method:'POST', headers:{ 'content-type':'application/json' }, body:'{not json',
    })
    expect(res.status).toBe(400)
  })
})