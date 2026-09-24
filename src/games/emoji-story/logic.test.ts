import { describe,it,expect } from 'vitest'
import { checkOrder } from './logic'
describe('emoji', ()=>{ it('ok', ()=> expect(checkOrder(['a','b'],['a','b'])).toBe(true)); it('fail', ()=> expect(checkOrder(['a'],['b'])).toBe(false)) })
