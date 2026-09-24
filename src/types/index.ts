export type Level = 'A1' | 'A2' | 'B1'
export type Team = { id: string; name: string; color: string; score: number; avatar: string }
export type GameId = 'spin-wheel' | 'quiz-race' | 'memory-match' | 'sentence-builder' | 'hangman' | 'word-reveal' | 'odd-one-out' | 'word-sort' | 'anagram' | 'emoji-story' | 'bingo' | 'pictionary' | 'twenty-questions'

export interface TopicItem { id: string; text: string; category: string; level: Level }
export interface QuizItem { id: string; category: string; question: string; options: string[]; answerIndex: number; explain?: string; level?: Level }
export interface PairItem { id: string; en: string; imageUrl?: string; definition?: string; audioUrl?: string }
export interface SentenceItem { id: string; sentence: string[]; distractors?: string[]; hint?: string; level?: Level }
export interface HangmanItem { id: string; word: string; hint: string; image?: string }
export interface RevealItem { id: string; word: string; image: string; hint?: string }

export interface OddOneOutItem { id: string; options: string[]; answerIndex: number; reason: string; category: string; level?: Level }
export interface WordSortItem { id: string; buckets: string[]; words: { text: string; bucketIndex: number }[]; level?: Level }
export interface AnagramItem { id: string; word: string; hint: string; level?: Level }
export interface EmojiStoryItem { id: string; emojis: string; answer: string[]; hint?: string; level?: Level }
export interface BingoItem { id: string; word: string; definition?: string }
export interface PictionaryItem { id: string; prompt: string; hint: string; category: string }
export interface TwentyQItem { id: string; secret: string; hints: string[]; category: string }

export interface PackMeta { id: string; name: string; type: GameId | 'generic'; level?: Level; count: number }
