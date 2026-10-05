import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchLeaderboard, submitScore, leaderboardEnabled, apiBase, SUBMIT_ERRORS } from './leaderboard'

function jsonResponse(body: unknown, status = 200) {
  return { ok: status>=200 && status<300, status, json: async ()=> body } as unknown as Response
}

describe('leaderboard client', ()=>{
  beforeEach(()=> vi.stubGlobal('fetch', vi.fn()))
  afterEach(()=> { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

  it('is disabled without VITE_API_URL', async ()=>{
    vi.stubEnv('VITE_API_URL', '')
    expect(leaderboardEnabled()).toBe(false)
    expect(await fetchLeaderboard('quiz-race')).toEqual([])
    expect((await submitScore({ game:'quiz-race', name:'Ana', correct:3, total:6 })).reason).toBe('offline')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('treats a bare slash as the same origin', async ()=>{
    vi.stubEnv('VITE_API_URL','/')
    expect(apiBase()).toBe('')
    expect(leaderboardEnabled()).toBe(true)
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ entries:[] }))
    await fetchLeaderboard('quiz-race')
    expect(fetch).toHaveBeenCalledWith('/api/leaderboard?game=quiz-race&limit=10')
  })

  it('accepts same-origin aliases', ()=>{
    for(const alias of ['/', 'same-origin', 'auto']) {
      vi.stubEnv('VITE_API_URL', alias)
      expect(apiBase()).toBe('')
    }
    vi.stubEnv('VITE_API_URL','https://x.example/')
    expect(apiBase()).toBe('https://x.example')
    vi.stubEnv('VITE_API_URL','https://x.example//')
    expect(apiBase()).toBe('https://x.example')
  })

  it('loads and sanitises entries', async ()=>{
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ entries:[
      { name:'Ana', xp:'45', correct:'3', total:'6' },
      { name: 42, xp:'bad' },
      null,
    ] }))
    const rows = await fetchLeaderboard('quiz-race', 5)
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/leaderboard?game=quiz-race&limit=5')
    expect(rows).toEqual([{ name:'Ana', xp:45, correct:3, total:6 }])
  })

  it('returns an empty board on failure', async ()=>{
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, 500))
    expect(await fetchLeaderboard('anagram')).toEqual([])
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    expect(await fetchLeaderboard('anagram')).toEqual([])
  })

  it('posts a score without ever sending xp', async ()=>{
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ entry:{ name:'Ana', xp:45, correct:3, total:6 }, personalBest:52 }))
    const res = await submitScore({ game:'quiz-race', name:'Ana', correct:3, total:6 })
    expect(res.ok).toBe(true)
    expect(res.personalBest).toBe(52)
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body).toEqual({ game:'quiz-race', name:'Ana', correct:3, total:6 })
    expect('xp' in body).toBe(false)
  })

  it('maps server rejection reasons to friendly copy', async ()=>{
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ reason:'rate-limited' }, 429))
    const res = await submitScore({ game:'anagram', name:'Ana', correct:1, total:6 })
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('rate-limited')
    expect(SUBMIT_ERRORS['rate-limited']).toBeTruthy()
  })

  it('handles a network error on submit', async ()=>{
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    vi.mocked(fetch).mockRejectedValue(new Error('boom'))
    expect((await submitScore({ game:'anagram', name:'Ana', correct:1, total:6 })).reason).toBe('network-error')
  })
})