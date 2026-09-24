import { describe, it, expect } from 'vitest'
import { usePowerUps } from './usePowerUps'
describe('usePowerUps', () => {
  it('double use once', () => { const p = usePowerUps(); expect(p.useDouble()).toBe(true); expect(p.useDouble()).toBe(false) })
  it('consume double', () => { const p = usePowerUps(); p.useDouble(); expect(p.consumeDouble()).toBe(true); expect(p.consumeDouble()).toBe(false) })
  it('freeze once', () => { const p = usePowerUps(); expect(p.useFreeze()).toBe(true); expect(p.useFreeze()).toBe(false) })
  it('reset', () => { const p = usePowerUps(); p.useDouble(); p.reset(); expect(p.doubleUsed.value).toBe(false) })
})
