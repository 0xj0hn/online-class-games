import confetti from 'canvas-confetti'

export function fireConfetti() {
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#58CC02', '#1CB0F6', '#FFC800', '#FF9600'] })
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.7 } }), 250)
}

export function playSfx(type: 'correct' | 'wrong' | 'bonus' = 'correct') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    const now = ctx.currentTime
    if (type === 'correct') { o.frequency.setValueAtTime(600, now); o.frequency.linearRampToValueAtTime(900, now + 0.15) }
    if (type === 'wrong') { o.frequency.setValueAtTime(300, now); o.frequency.linearRampToValueAtTime(150, now + 0.2) }
    if (type === 'bonus') { o.frequency.setValueAtTime(400, now); o.frequency.linearRampToValueAtTime(1200, now + 0.3) }
    g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    o.start(now); o.stop(now + 0.3)
  } catch {}
}
