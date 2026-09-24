import type { PairItem } from '@/types'

export type Card = { uid: string; pairId: string; label: string; type: 'word'|'def' }

export function makeCards(pairs: PairItem[]): Card[] {
  const cards: Card[] = []
  for (const p of pairs) {
    cards.push({ uid: p.id+'-w', pairId: p.id, label: p.en, type: 'word' })
    cards.push({ uid: p.id+'-d', pairId: p.id, label: p.definition || p.en, type: 'def' })
  }
  return shuffle(cards)
}
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*a.length) % (i+1); [a[i],a[j]]=[a[j],a[i]] }
  return a
}
export function isMatch(a: Card, b: Card): boolean {
  return a.pairId===b.pairId && a.uid!==b.uid
}
