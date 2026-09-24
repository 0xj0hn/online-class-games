import { describe,it,expect } from 'vitest'
import { nextPromptIdx } from './logic'
describe('pictionary', ()=>{ it('next', ()=> expect(nextPromptIdx(0,3)).toBe(1)) })
