import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useTimer } from './useTimer'

describe('useTimer', ()=>{
  afterEach(()=> vi.useRealTimers())

  it('counts down and stops at zero', ()=>{
    vi.useFakeTimers()
    const scope = effectScope()
    const t = scope.run(()=> useTimer(3))!
    t.start()
    vi.advanceTimersByTime(3000)
    expect(t.remaining.value).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(t.running.value).toBe(false)
    scope.stop()
  })

  it('toggle pauses the countdown', ()=>{
    vi.useFakeTimers()
    const scope = effectScope()
    const t = scope.run(()=> useTimer(10))!
    t.start()
    vi.advanceTimersByTime(2000)
    t.toggle()
    expect(t.running.value).toBe(false)
    vi.advanceTimersByTime(5000)
    expect(t.remaining.value).toBe(8)
    scope.stop()
  })

  it('toggle resumes from remaining without changing total', ()=>{
    vi.useFakeTimers()
    const scope = effectScope()
    const t = scope.run(()=> useTimer(20))!
    t.start()
    vi.advanceTimersByTime(3000)
    t.toggle()
    t.toggle()
    expect(t.running.value).toBe(true)
    expect(t.total.value).toBe(20)
    expect(t.remaining.value).toBe(17)
    vi.advanceTimersByTime(1000)
    expect(t.remaining.value).toBe(16)
    scope.stop()
  })

  it('resume restarts a spent timer', ()=>{
    vi.useFakeTimers()
    const scope = effectScope()
    const t = scope.run(()=> useTimer(5))!
    t.start()
    vi.advanceTimersByTime(6000)
    expect(t.running.value).toBe(false)
    t.toggle()
    expect(t.running.value).toBe(true)
    expect(t.remaining.value).toBe(5)
    scope.stop()
  })

  it('reset restores the full duration', ()=>{
    vi.useFakeTimers()
    const scope = effectScope()
    const t = scope.run(()=> useTimer(10))!
    t.start()
    vi.advanceTimersByTime(4000)
    t.reset()
    expect(t.remaining.value).toBe(10)
    expect(t.running.value).toBe(false)
    scope.stop()
  })
})