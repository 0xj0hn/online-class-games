export function checkOrder(expected: string[], actual: string[]): boolean {
  if (expected.length !== actual.length) return false
  return expected.every((w,i)=> w.toLowerCase()===actual[i].toLowerCase())
}
export function shuffleWords(words: string[]): string[] {
  const a=[...words]
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a
}
