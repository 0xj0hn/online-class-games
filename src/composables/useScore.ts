export function xpFor(correct: boolean, remaining: number, total: number, base: number): number {
  if (!correct) return 0
  const bonus = Math.floor((remaining / total) * (base / 2))
  return base + bonus
}
export function streakBonus(streak: number): number {
  return Math.min(15, streak * 5)
}
export function totalXp(baseXp: number, streak: number): number {
  return baseXp + streakBonus(streak)
}
