export const PACK_TYPES = [
  'topics', 'quiz', 'pairs', 'sentences', 'hangman', 'reveal',
  'odd-one-out', 'word-sort', 'anagram', 'emoji-story',
  'bingo', 'pictionary', 'twenty-questions',
] as const

export type PackType = typeof PACK_TYPES[number]

const KNOWN: ReadonlySet<string> = new Set(PACK_TYPES)

export function isPackType(value: unknown): value is PackType {
  return typeof value === 'string' && KNOWN.has(value)
}