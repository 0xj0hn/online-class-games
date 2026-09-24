import type { TopicItem } from '@/types'
export function pickRandom<T>(arr: T[], seed?: number): T {
  if (!arr.length) throw new Error('empty array')
  const idx = seed !== undefined ? Math.abs(seed) % arr.length : Math.floor(Math.random()*arr.length)
  return arr[idx]
}
export function spinTopics(topics: TopicItem[], seed?: number): TopicItem {
  return pickRandom(topics, seed)
}
export function calcXpForSpin(): number { return 10 }
