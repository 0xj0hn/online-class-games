import type { QuizItem } from '@/types'
export function checkAnswer(item: QuizItem, chosenIndex: number): boolean {
  return chosenIndex === item.answerIndex
}
export function nextTurnIndex(current: number, total: number): number {
  return (current + 1) % total
}
export function xpForQuiz(correct: boolean): number { return correct ? 15 : 0 }
