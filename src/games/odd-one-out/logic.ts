import type { OddOneOutItem } from '@/types'
export function isCorrect(item: OddOneOutItem, chosen:number): boolean { return chosen===item.answerIndex }
export function xpForOdd(correct:boolean): number { return correct?10:0 }
