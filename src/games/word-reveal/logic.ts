export function xpForStage(stage: number): number {
  // stage 0 = not revealed, 1..4
  if(stage<=1) return 20
  if(stage===2) return 15
  if(stage===3) return 10
  return 5
}
export function nextStage(cur: number): number { return Math.min(4, cur+1) }
