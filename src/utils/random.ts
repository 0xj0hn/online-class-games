export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function shuffledIndices(n: number): number[] {
  return shuffle([...Array(n).keys()])
}

export function pickRandomIndexExcluding(n: number, exclude: number): number {
  if (n <= 1) return 0
  let r = Math.floor(Math.random() * (n - 1))
  if (r >= exclude) r += 1
  return r
}
