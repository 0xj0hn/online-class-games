import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, it, expect, vi } from 'vitest'
import AnagramPractice from './AnagramPractice.vue'
import { practicePoolSize, practiceRoundLength } from './registry'
import { anagramSeed, quizSeed } from '@/data/seed'

vi.mock('@/utils/random', ()=>({
  shuffle: (a: any[]) => [...a],
  shuffledIndices: () => [],
  pickRandomIndexExcluding: () => 0,
}))
vi.mock('@/utils/effects', ()=>({ fireConfetti: ()=>{}, playSfx: ()=>{} }))

function mountGame(round = 1) {
  return mount(AnagramPractice, {
    props: { round },
    global: { plugins:[createPinia()] },
  })
}

describe('AnagramPractice', ()=>{
  it('shows a jumbled first word and hides the answer', ()=>{
    const w = mountGame()
    expect(w.get('[data-testid="practice-jumble"]').text().length).toBeGreaterThan(0)
    expect(w.text()).not.toContain(anagramSeed[0].word)
  })

  it('accepts the right word case-insensitively', async ()=>{
    const w = mountGame()
    await w.get('[data-testid="practice-input"]').setValue(anagramSeed[0].word.toLowerCase())
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    expect(w.emitted('record')).toEqual([[true]])
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain('Correct')
  })

  it('reveals the word after a wrong answer', async ()=>{
    const w = mountGame()
    await w.get('[data-testid="practice-input"]').setValue('zzz')
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    expect(w.emitted('record')).toEqual([[false]])
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain(anagramSeed[0].word)
  })

  it('will not score the same question twice', async ()=>{
    const w = mountGame()
    await w.get('[data-testid="practice-input"]').setValue(anagramSeed[0].word)
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    expect(w.emitted('record')).toHaveLength(1)
  })

  it('fails the question when time runs out', async ()=>{
    const w = mountGame()
    ;(w.vm as any).timeUp()
    await flushPromises()
    expect(w.emitted('record')).toEqual([[false]])
    expect(w.get('[data-testid="practice-feedback"]').text()).toContain('❌')
  })

  it('advances to the next word', async ()=>{
    const w = mountGame()
    const first = w.get('[data-testid="practice-jumble"]').text()
    await w.get('[data-testid="practice-input"]').setValue('zzz')
    await w.get('[data-testid="practice-submit"]').trigger('click')
    await flushPromises()
    await w.get('[data-testid="practice-next"]').trigger('click')
    expect(w.get('[data-testid="practice-jumble"]').text()).not.toBe(first)
    expect((w.get('[data-testid="practice-input"]').element as HTMLInputElement).value).toBe('')
  })

  it('disables next on the last word of the pack', async ()=>{
    const w = mountGame()
    for(let i=0; i<anagramSeed.length; i++) {
      await w.get('[data-testid="practice-input"]').setValue('zzz')
      await w.get('[data-testid="practice-submit"]').trigger('click')
      await flushPromises()
      const nextBtn = w.get('[data-testid="practice-next"]')
      const last = i === anagramSeed.length - 1
      if(last) expect(nextBtn.attributes('disabled')).toBeDefined()
      else await nextBtn.trigger('click')
    }
    expect(w.emitted('record')).toHaveLength(anagramSeed.length)
  })

  it('reshuffles when a new round starts', async ()=>{
    const w = mountGame()
    w.setProps({ round: 2 })
    await flushPromises()
    expect(w.emitted('record')).toBeUndefined()
    expect(w.find('[data-testid="practice-feedback"]').exists()).toBe(false)
  })
})

describe('practice registry', ()=>{
  it('falls back to seed size with no overrides', ()=>{
    expect(practicePoolSize({}, 'quiz-race')).toBe(quizSeed.length)
    expect(practicePoolSize({}, 'anagram')).toBe(anagramSeed.length)
  })
  it('prefers the teacher override pack', ()=>{
    const overrides = { quiz: new Array(20).fill({ id:'q' }) }
    expect(practicePoolSize(overrides, 'quiz-race')).toBe(20)
  })
  it('ignores an empty override pack', ()=>{
    expect(practicePoolSize({ quiz: [] }, 'quiz-race')).toBe(quizSeed.length)
  })
  it('caps the round at 10 questions', ()=>{
    expect(practiceRoundLength({ quiz: new Array(40).fill({}) }, 'quiz-race')).toBe(10)
    expect(practiceRoundLength({}, 'quiz-race')).toBe(quizSeed.length)
  })
  it('returns 0 for an unknown game', ()=>{
    expect(practicePoolSize({}, null)).toBe(0)
    expect(practiceRoundLength({}, null)).toBe(0)
  })
})