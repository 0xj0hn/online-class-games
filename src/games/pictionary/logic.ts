export function nextPromptIdx(cur:number, total:number): number { return (cur+1)%total }
export function xpForPictionary(remaining:number, total:number): number { return 15 + Math.floor((remaining/total)*7) }
