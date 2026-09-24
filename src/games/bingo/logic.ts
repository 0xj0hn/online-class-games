import type { BingoItem } from '@/types'
export function makeBoard(pool: BingoItem[], size=3): BingoItem[] {
  const a=[...pool]
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a.slice(0,size*size)
}
export function checkBingo(board: BingoItem[], drawn:Set<string>): boolean {
  const n=Math.sqrt(board.length)
  if(!Number.isInteger(n)) return false
  // rows
  for(let r=0;r<n;r++){ let ok=true; for(let c=0;c<n;c++) if(!drawn.has(board[r*n+c].id)) ok=false; if(ok) return true }
  // cols
  for(let c=0;c<n;c++){ let ok=true; for(let r=0;r<n;r++) if(!drawn.has(board[r*n+c].id)) ok=false; if(ok) return true }
  // diag
  let ok=true; for(let i=0;i<n;i++) if(!drawn.has(board[i*n+i].id)) ok=false; if(ok) return true
  ok=true; for(let i=0;i<n;i++) if(!drawn.has(board[i*n+(n-1-i)].id)) ok=false; if(ok) return true
  return false
}
export function drawNext(pool: BingoItem[], drawn:Set<string>): BingoItem | null {
  const remain=pool.filter(p=>!drawn.has(p.id))
  if(!remain.length) return null
  return remain[Math.floor(Math.random()*remain.length)]
}
