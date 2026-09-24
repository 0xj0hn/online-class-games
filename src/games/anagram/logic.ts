export function scramble(word:string): string {
  if(word.length<=2) return word
  let s=word.split('')
  for(let k=0;k<3;k++){
    for(let i=s.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [s[i],s[j]]=[s[j],s[i]] }
    if(s.join('')!==word) return s.join('')
  }
  return s.join('')
}
export function checkAnswer(word:string, input:string): boolean {
  return word.toLowerCase().trim()===input.toLowerCase().trim()
}
