import { describe, it, expect, beforeEach } from 'vitest'
import { useStudent } from './useStudent'

describe('useStudent', ()=>{
  beforeEach(()=> localStorage.clear())

  it('starts empty and rejects bad names', ()=>{
    const s = useStudent()
    expect(s.name.value).toBe('')
    expect(s.save('a')).toBe(false)
    expect(s.name.value).toBe('')
  })

  it('saves a trimmed name and remembers it', ()=>{
    const s = useStudent()
    expect(s.save('  Ana ')).toBe(true)
    expect(s.name.value).toBe('Ana')
    expect(useStudent().name.value).toBe('Ana')
  })

  it('clears the stored name', ()=>{
    const s = useStudent()
    s.save('Ana')
    s.clear()
    expect(s.name.value).toBe('')
    expect(useStudent().name.value).toBe('')
  })
})