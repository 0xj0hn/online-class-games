import { ref, computed, onUnmounted } from 'vue'
export function useTimer(initialSec = 15) {
  const total = ref(initialSec)
  const remaining = ref(initialSec)
  const running = ref(false)
  let id: ReturnType<typeof setInterval> | null = null
  const progress = computed(()=> (remaining.value/total.value)*100)
  function start(sec?: number){
    if(sec) { total.value=sec; remaining.value=sec }
    else remaining.value=total.value
    running.value=true
    if(id) clearInterval(id)
    id=setInterval(()=>{ if(remaining.value>0) remaining.value-=1; else stop() },1000)
  }
  function stop(){ running.value=false; if(id) clearInterval(id); id=null }
  function reset(){ stop(); remaining.value=total.value }
  onUnmounted(stop)
  return { total, remaining, running, progress, start, stop, reset }
}
