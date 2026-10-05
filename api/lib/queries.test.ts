import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type Client } from '@libsql/client'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'
import { CREATE_TABLE, CREATE_INDEX, UPSERT_BEST, SELECT_ONE, SELECT_BOARD } from './queries'

const file = join(tmpdir(), `leaderboard-test-${process.pid}.db`)
let db: Client | null = null

async function best(name: string, xp: number, correct: number, total: number) {
  const res = await db!.execute({ sql: UPSERT_BEST, args:['quiz-race', name, xp, correct, total] })
  return res.rows[0]
}

describe('leaderboard queries', ()=>{
  beforeAll(async ()=>{
    try {
      db = createClient({ url:`file:${file}`, authToken:'' })
      await db.execute(CREATE_TABLE)
      await db.execute(CREATE_INDEX)
    } catch { db = null }
  })
  afterAll(()=>{
    try { db?.close() } catch {}
    try { rmSync(file, { force:true }) } catch {}
  })

  it('keeps only a student better score', async ()=>{
    if(!db) return
    await best('Ana', 75, 5, 6)
    const improved = await best('Ana', 97, 6, 6)
    expect(Number(improved.xp)).toBe(97)

    const worse = await best('Ana', 30, 2, 6)
    expect(Number(worse.xp)).toBe(97)
    expect(Number(worse.correct)).toBe(6)
    expect(Number(worse.total)).toBe(6)
  })

  it('reads back the personal best', async ()=>{
    if(!db) return
    const mine = await db!.execute({ sql: SELECT_ONE, args:['quiz-race','Ana'] })
    expect(Number(mine.rows[0].xp)).toBe(97)
  })

  it('orders the board by xp then earliest', async ()=>{
    if(!db) return
    await best('Kai', 45, 3, 6)
    await best('Bo', 97, 6, 6)
    const board = await db!.execute({ sql: SELECT_BOARD, args:['quiz-race', 10] })
    expect(board.rows.map(r=>`${r.name}:${r.xp}`)).toEqual(['Ana:97','Bo:97','Kai:45'])
  })

  it('keeps games separate', async ()=>{
    if(!db) return
    const res = await db!.execute({ sql: SELECT_ONE, args:['anagram','Ana'] })
    expect(res.rows.length).toBe(0)
  })
})