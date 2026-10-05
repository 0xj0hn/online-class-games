import { ref, computed, type Ref } from 'vue'
import { practiceRoundXp, PRACTICE_MIN_ROUND, PRACTICE_MAX_ROUND, type PracticeGameId } from '@/practice/config'

export function usePracticeRound(game: Ref<PracticeGameId | null>, total: Ref<number>) {
  const answered = ref(0)
  const correct = ref(0)
  const streak = ref(0)
  const bestStreak = ref(0)
  const finished = ref(false)

  const xp = computed(()=> practiceRoundXp(game.value, correct.value, total.value))
  const accuracy = computed(()=> answered.value>0 ? Math.round((correct.value/answered.value)*100) : 0)
  const submittable = computed(()=> total.value>=PRACTICE_MIN_ROUND && total.value<=PRACTICE_MAX_ROUND && answered.value>0)

  function record(ok: boolean) {
    if(finished.value) return
    answered.value++
    if(ok) { correct.value++; streak.value++; bestStreak.value=Math.max(bestStreak.value, streak.value) }
    else streak.value=0
    if(answered.value>=total.value) finished.value=true
  }

  function reset() {
    answered.value=0; correct.value=0; streak.value=0; bestStreak.value=0; finished.value=false
  }

  return { answered, correct, streak, bestStreak, finished, xp, accuracy, submittable, record, reset }
}