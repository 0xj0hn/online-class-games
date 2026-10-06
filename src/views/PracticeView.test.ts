import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import PracticeView from '@/views/PracticeView.vue'
import * as api from '@/services/leaderboard'
import { quizSeed } from '@/data/seed'
import QuizRacePractice from '@/practice/QuizRacePractice.vue'
import { usePackStore } from '@/stores/packStore'
import * as packsApi from '@/services/packs'

const route = { params: { id:'quiz-race' } }
vi.mock('vue-router', ()=> ({ useRoute: ()=> route }))
vi.mock('@/utils/random', ()=>({
  shuffle: (a: any[]) => [...a],
  shuffledIndices: () => [],
  pickRandomIndexExcluding: () => 0,
}))
vi.mock('@/utils/effects', ()=>({ fireConfetti: ()=>{}, playSfx: ()=>{} }))

const ROUND = 6

async function mountView() {
  const w = mount(PracticeView, { global: { plugins:[createPinia()], stubs:{ RouterLink:true } } })
  await flushPromises()
  await usePackStore().load()
  await flushPromises()
  return w
}

async function answerQ(w: any, answerIndex: number, wantCorrect = true) {
  const pick = wantCorrect ? answerIndex : (answerIndex === 0 ? 1 : 0)
  await w.get(`[data-testid="opt-${pick}"]`).trigger('click')
  await w.get('[data-testid="practice-submit"]').trigger('click')
  await flushPromises()
}

async function playRound(w: any, pattern: boolean[]) {
  for(let i=0; i<pattern.length; i++) {
    await answerQ(w, quizSeed[i].answerIndex, pattern[i])
    const nextBtn = w.findAll('[data-testid="practice-next"]').at(-1)
    if(nextBtn && !nextBtn.attributes('disabled')) await nextBtn.trigger('click')
  }
  await flushPromises()
}

const allRight = (n: number) => Array.from({ length:n }, () => true)

describe('PracticeView', ()=>{
  beforeEach(()=>{
    localStorage.clear()
    localStorage.setItem('bbb.practice.student','Ana')
    vi.spyOn(api,'fetchLeaderboard').mockResolvedValue([])
    vi.spyOn(api,'submitScore').mockResolvedValue({ ok:true, personalBest:45 })
    vi.spyOn(packsApi,'fetchPacks').mockResolvedValue({ ok:false, reason:'offline' })
    vi.spyOn(packsApi,'savePacks').mockResolvedValue({ ok:true, updatedAt:'now', items:0 })
  })
  afterEach(()=> vi.restoreAllMocks())

  it('asks for a name before playing', async ()=>{
    localStorage.clear()
    const w = await mountView()
    expect(w.find('[data-testid="practice-name-input"]').exists()).toBe(true)
    expect(w.find('[data-testid="practice-submit"]').exists()).toBe(false)
  })

  it('stores the name and reveals the game', async ()=>{
    localStorage.clear()
    const w = await mountView()
    await w.get('[data-testid="practice-name-input"]').setValue('Kai')
    await w.get('[data-testid="practice-name-save"]').trigger('click')
    await flushPromises()
    expect(localStorage.getItem('bbb.practice.student')).toBe('Kai')
    expect(w.find('[data-testid="practice-submit"]').exists()).toBe(true)
  })

  it('rejects a too-short name without saving', async ()=>{
    localStorage.clear()
    const w = await mountView()
    await w.get('[data-testid="practice-name-input"]').setValue('K')
    await w.get('[data-testid="practice-name-save"]').trigger('click')
    await flushPromises()
    expect(localStorage.getItem('bbb.practice.student')).toBeNull()
  })

  it('scores a correct answer and advances', async ()=>{
    const w = await mountView()
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('0')
    expect(w.text()).toContain('Question 1 of 6')
    await w.get('[data-testid="opt-1"]').trigger('click')
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('1')
    expect(w.get('[data-testid="practice-streak"]').text()).toContain('1')
    expect(w.get('[data-testid="practice-xp"]').text()).toContain('15 XP')
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain('Correct')
    await w.get('[data-testid="practice-next"]').trigger('click')
    expect(w.find('[data-testid="practice-feedback"]').exists()).toBe(false)
    expect(w.text()).toContain('Question 2 of 6')
  })

  it('shows the answer after a wrong guess', async ()=>{
    const w = await mountView()
    await w.get('[data-testid="opt-0"]').trigger('click')
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain('❌')
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('0')
    expect(w.get('[data-testid="practice-streak"]').text()).toContain('0')
  })

  it('pauses and resumes the per-question timer', async ()=>{
    const w = await mountView()
    expect(w.get('[data-testid="timer-toggle"]').text()).toContain('Pause')
    await w.get('[data-testid="timer-toggle"]').trigger('click')
    expect(w.get('[data-testid="timer-toggle"]').text()).toContain('Start')
    await w.get('[data-testid="timer-toggle"]').trigger('click')
    expect(w.get('[data-testid="timer-toggle"]').text()).toContain('Pause')
  })

  it('restarts cleanly after finishing a round', async ()=>{
    const w = await mountView()
    await playRound(w, allRight(ROUND))
    expect(w.get('[data-testid="practice-summary"]').text()).toContain(`6/${ROUND} correct`)
    expect(w.get('[data-testid="practice-xp"]').text()).toContain(`${ROUND*15+7} XP`)
    await w.get('[data-testid="practice-restart"]').trigger('click')
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('0')
    expect(w.find('[data-testid="practice-summary"]').exists()).toBe(false)
  })

  it('submits correct/total for the server to score, never xp', async ()=>{
    const w = await mountView()
    await playRound(w, [true, true, false, true, true, true])
    await w.get('[data-testid="practice-submit-score"]').trigger('click')
    await flushPromises()
    expect(api.submitScore).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(api.submitScore).mock.calls[0][0]
    expect(payload).toEqual({ game:'quiz-race', name:'Ana', correct:5, total:ROUND })
    expect('xp' in payload).toBe(false)
    expect(w.get('[data-testid="practice-notice"]').text()).toContain('Ana')
  })

  it('reports a leaderboard failure without losing the round', async ()=>{
    vi.mocked(api.submitScore).mockResolvedValue({ ok:false, reason:'network-error' })
    const w = await mountView()
    await playRound(w, [true, true, false, true, true, false])
    await w.get('[data-testid="practice-submit-score"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="practice-notice"]').text()).toContain('connection')
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('4')
  })

  it('fails the question when the timer runs out', async ()=>{
    vi.useFakeTimers()
    const w = mount(PracticeView, { global: { plugins:[createPinia()], stubs:{ RouterLink:true } } })
    await usePackStore().load()
    await vi.advanceTimersByTimeAsync(0)
    expect(w.get('[data-testid="practice-timer"]').text()).toContain('15s')
    await vi.advanceTimersByTimeAsync(16_000)
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('0')
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain('❌')
    vi.useRealTimers()
  })

  it('gives the next question a fresh timer after an answer', async ()=>{
    vi.useFakeTimers()
    const w = mount(PracticeView, { global: { plugins:[createPinia()], stubs:{ RouterLink:true } } })
    await usePackStore().load()
    await vi.advanceTimersByTimeAsync(0)
    expect(w.get('[data-testid="practice-timer"]').text()).toContain('15s')
    await vi.advanceTimersByTimeAsync(5_000)
    expect(w.get('[data-testid="practice-timer"]').text()).toContain('10s')
    await answerQ(w, quizSeed[0].answerIndex, true)
    expect(w.get('[data-testid="practice-timer"]').text()).toContain('15s')
    vi.useRealTimers()
  })

  it('does not restart the timer while manually paused', async ()=>{
    vi.useFakeTimers()
    const w = mount(PracticeView, { global: { plugins:[createPinia()], stubs:{ RouterLink:true } } })
    await usePackStore().load()
    await vi.advanceTimersByTimeAsync(0)
    await w.get('[data-testid="timer-toggle"]').trigger('click')
    await answerQ(w, quizSeed[0].answerIndex, true)
    expect(w.get('[data-testid="practice-timer"]').text()).toContain('15s')
    expect(w.get('[data-testid="timer-toggle"]').text()).toContain('Start')
    vi.useRealTimers()
  })

  it('marks a question wrong via the exposed timeUp hook', async ()=>{
    const w = await mountView()
    const game = w.findComponent(QuizRacePractice)
    expect(typeof game.vm.timeUp).toBe('function')
    ;(game.vm as any).timeUp()
    await flushPromises()
    expect(w.get('[data-testid="practice-correct"]').text()).toContain('0')
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain('❌')
  })

  it('renders the class leaderboard', async ()=>{
    vi.stubEnv('VITE_API_URL','https://api.example.com')
    vi.mocked(api.fetchLeaderboard).mockResolvedValue([
      { name:'Ana', xp:45, correct:3, total:6 },
      { name:'Kai', xp:30, correct:2, total:6 },
    ])
    const w = await mountView()
    await flushPromises()
    const list = w.get('[data-testid="leaderboard-list"]').text()
    expect(list).toContain('Ana')
    expect(list).toContain('45 XP')
    expect(list).toContain('Kai')
    vi.unstubAllEnvs()
  })

  it('says the leaderboard is offline when no API url is set', async ()=>{
    vi.stubEnv('VITE_API_URL','')
    const w = await mountView()
    await flushPromises()
    expect(w.text()).toContain('offline')
    vi.unstubAllEnvs()
  })

  it('rejects an unknown practice game', async ()=>{
    route.params.id = 'bingo'
    const w = await mountView()
    expect(w.text()).toContain('No practice mode')
    route.params.id = 'quiz-race'
  })
})