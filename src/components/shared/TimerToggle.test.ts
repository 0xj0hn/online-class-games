import { mount } from '@vue/test-utils'
import TimerToggle from './TimerToggle.vue'
import { describe, it, expect } from 'vitest'

describe('TimerToggle', ()=>{
  it('shows pause while running and start while paused', ()=>{
    const running = mount(TimerToggle, { props:{ running:true } })
    expect(running.text()).toContain('Pause')
    const paused = mount(TimerToggle, { props:{ running:false } })
    expect(paused.text()).toContain('Start')
  })
  it('emits toggle on click', async ()=>{
    const w = mount(TimerToggle, { props:{ running:true } })
    await w.get('[data-testid="timer-toggle"]').trigger('click')
    expect(w.emitted('toggle')).toHaveLength(1)
  })
  it('can be disabled', ()=>{
    const w = mount(TimerToggle, { props:{ running:true, disabled:true } })
    expect(w.get('[data-testid="timer-toggle"]').attributes('disabled')).toBeDefined()
  })
})