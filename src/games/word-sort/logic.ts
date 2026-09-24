import type { WordSortItem } from '@/types'
export function checkPlacements(item: WordSortItem, placements: Record<string, number>): { correct: number; total: number } {
  let correct=0
  for(const w of item.words){
    if(placements[w.text]===w.bucketIndex) correct++
  }
  return { correct, total: item.words.length }
}
