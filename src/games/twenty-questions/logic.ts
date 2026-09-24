export type TqState = { secret:string; hints:string[]; asked:string[]; remaining:number; revealedHints:number }
export function makeState(secret:string, hints:string[]): TqState { return { secret:secret.toUpperCase(), hints, asked:[], remaining:20, revealedHints:0 } }
export function ask(state:TqState, q:string): TqState { state.asked.push(q); state.remaining-=1; if(state.remaining===13 || state.remaining===6) state.revealedHints=Math.min(state.hints.length, state.revealedHints+1); return state }
export function guess(state:TqState, g:string): boolean { return g.toUpperCase().trim()===state.secret }
export function isOver(state:TqState): boolean { return state.remaining<=0 }
