export function makeState(word: string){
  return { word: word.toUpperCase(), guessed: new Set<string>(), lives: 6 }
}
export type HangState = ReturnType<typeof makeState>
export function guess(state: HangState, letter: string){
  const L = letter.toUpperCase()
  if(state.guessed.has(L)) return state
  state.guessed.add(L)
  if(!state.word.includes(L)) state.lives -= 1
  return state
}
export function displayWord(state: HangState): string {
  return state.word.split('').map(c=> state.guessed.has(c) ? c : '_').join(' ')
}
export function isWon(state: HangState): boolean {
  return state.word.split('').every(c=> state.guessed.has(c))
}
export function isLost(state: HangState): boolean { return state.lives <=0 }
