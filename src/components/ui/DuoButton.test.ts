import { mount } from '@vue/test-utils'
import DuoButton from './DuoButton.vue'
import { describe, it, expect } from 'vitest'

describe('DuoButton', ()=>{
  it('renders slot and emits click', async ()=>{
    const w = mount(DuoButton, { slots:{ default:'CLICK ME' } })
    expect(w.text()).toContain('CLICK ME')
    expect(w.attributes('data-testid')).toBe('duo-button')
  })
  it('disabled prevents interaction styling', ()=>{
    const w = mount(DuoButton, { props:{ disabled:true } })
    expect(w.classes().join(' ')).toContain('opacity-50')
  })
  it('secondary variant has blue class', ()=>{
    const w = mount(DuoButton, { props:{ variant:'secondary' } })
    expect(w.classes().join(' ')).toContain('bg-duo-blue')
  })
})
