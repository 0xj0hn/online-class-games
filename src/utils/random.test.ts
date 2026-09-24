import { describe, it, expect } from 'vitest'
import { shuffle, shuffledIndices, pickRandomIndexExcluding } from './random'

describe('random utils', () => {
  it('shuffle keeps elements', () => {
    const a = [1, 2, 3, 4, 5]
    const s = shuffle(a)
    expect(s).toHaveLength(5)
    expect([...s].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5])
  })
  it('shuffledIndices contains all indices', () => {
    const idx = shuffledIndices(4)
    expect([...idx].sort((x, y) => x - y)).toEqual([0, 1, 2, 3])
  })
  it('pickRandomIndexExcluding never picks excluded', () => {
    for (let i = 0; i < 20; i++) expect(pickRandomIndexExcluding(5, 2)).not.toBe(2)
  })
  it('pickRandom with n=1', () => expect(pickRandomIndexExcluding(1, 0)).toBe(0))
})
