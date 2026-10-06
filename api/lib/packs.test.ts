import { describe, it, expect } from 'vitest'
import { validatePacks, checkAdminKey, MAX_PACK_BYTES, MAX_TOTAL_ITEMS, ADMIN_HEADER } from './packs'

function ok(packs: unknown){ return validatePacks(packs) }

describe('validatePacks', ()=>{
  it('accepts a normal pack set wrapped or bare', ()=>{
    const wrapped = ok({ packs:{ quiz:[{id:'q1',question:'x'}] } })
    expect(wrapped.ok).toBe(true)
    if(wrapped.ok) expect(wrapped.packs.quiz).toEqual([{ id:'q1', question:'x' }])

    const bare = ok({ quiz:[{id:'q1'}] })
    expect(bare.ok).toBe(true)
  })

  it('accepts every known pack type', ()=>{
    const all = Object.fromEntries([
      'topics','quiz','pairs','sentences','hangman','reveal','odd-one-out',
      'word-sort','anagram','emoji-story','bingo','pictionary','twenty-questions',
    ].map(k=> [k, [{ id:'1' }]]))
    expect(ok(all).ok).toBe(true)
  })

  it('accepts an empty pack set', ()=>{
    expect(ok({}).ok).toBe(true)
    expect(ok({ packs:{} }).ok).toBe(true)
  })

  it('rejects unknown pack names', ()=>{
    for(const key of ['nope','__proto__','constructor','Quiz','quiz2','']) {
      expect(ok({ [key]: [] }).ok, key).toBe(false)
    }
  })

  it('rejects non-array and non-object shapes', ()=>{
    expect(ok({ quiz:'nope' }).ok).toBe(false)
    expect(ok(null).ok).toBe(false)
    expect(ok([]).ok).toBe(false)
    expect(ok('nope').ok).toBe(false)
    expect(ok(42).ok).toBe(false)
  })

  it('rejects bad items', ()=>{
    expect(ok({ quiz:[null] }).ok).toBe(false)
    expect(ok({ quiz:['text'] }).ok).toBe(false)
    expect(ok({ quiz:[[1,2]] }).ok).toBe(false)
  })

  it('parses a json string body', ()=>{
    const res = ok(JSON.stringify({ quiz:[{id:'q1'}] }))
    expect(res.ok).toBe(true)
    if(res.ok) expect(res.packs.quiz).toHaveLength(1)
  })

  it('rejects a malformed json string', ()=>{
    expect(ok('{not json').ok).toBe(false)
  })

  it('caps total items', ()=>{
    const many = { quiz: new Array(MAX_TOTAL_ITEMS + 1).fill({ id:'1' }) }
    const res = ok(many)
    expect(res).toMatchObject({ ok:false, status:413, reason:'too-many-items' })
  })

  it('caps the payload size', ()=>{
    const big = { quiz:[{ id:'1', text:'x'.repeat(MAX_PACK_BYTES) }] }
    const res = ok(big)
    expect(res).toMatchObject({ ok:false, status:413, reason:'packs-too-large' })
  })

  it('reports the item count', ()=>{
    const res = ok({ quiz:[{id:'1'},{id:'2'}], topics:[{id:'3'}] })
    expect(res.ok).toBe(true)
    if(res.ok) expect(res.items).toBe(3)
  })
})

describe('checkAdminKey', ()=>{
  it('uses the documented header name', ()=>{
    expect(ADMIN_HEADER).toBe('x-admin-key')
  })
  it('accepts the configured key', ()=>{
    expect(checkAdminKey('secret', 'secret')).toBe('ok')
  })
  it('rejects a wrong key', ()=>{
    expect(checkAdminKey('nope', 'secret')).toBe('wrong')
    expect(checkAdminKey('secret-longer', 'secret')).toBe('wrong')
  })
  it('reports a missing key separately from a wrong one', ()=>{
    expect(checkAdminKey('', 'secret')).toBe('missing')
    expect(checkAdminKey(undefined, 'secret')).toBe('missing')
    expect(checkAdminKey(null, 'secret')).toBe('missing')
  })
  it('reports when the server has no key configured', ()=>{
    expect(checkAdminKey('anything', '')).toBe('not-configured')
    expect(checkAdminKey('anything', undefined)).toBe('not-configured')
  })
})