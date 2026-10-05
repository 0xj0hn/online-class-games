import type { Component } from 'vue'
import QuizRacePractice from './QuizRacePractice.vue'
import AnagramPractice from './AnagramPractice.vue'
import { anagramSeed, quizSeed } from '@/data/seed'
import { roundLengthFor, type PracticeGameId } from './config'

export interface PracticeEntry {
  component: Component
  packKey: string
  seedSize: number
}

export const PRACTICE_REGISTRY: Record<PracticeGameId, PracticeEntry> = {
  'quiz-race': { component: QuizRacePractice, packKey:'quiz', seedSize:quizSeed.length },
  'anagram': { component: AnagramPractice, packKey:'anagram', seedSize:anagramSeed.length },
}

export function practicePoolSize(overrides: Record<string, any[]>, game: PracticeGameId | null): number {
  const entry = game ? PRACTICE_REGISTRY[game] : undefined
  if(!entry) return 0
  const pack = overrides[entry.packKey]
  return Array.isArray(pack) && pack.length ? pack.length : entry.seedSize
}

export function practiceRoundLength(overrides: Record<string, any[]>, game: PracticeGameId | null): number {
  return roundLengthFor(game, practicePoolSize(overrides, game))
}