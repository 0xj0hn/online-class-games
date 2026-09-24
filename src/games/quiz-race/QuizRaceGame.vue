<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { quizSeed } from '@/data/seed'
import { checkAnswer } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'
import PowerUpsBar from '@/components/shared/PowerUpsBar.vue'
import XpToast from '@/components/shared/XpToast.vue'
import BonusSpin from '@/components/shared/BonusSpin.vue'
import { useTimer } from '@/composables/useTimer'
import { xpFor, streakBonus } from '@/composables/useScore'
import { usePowerUps } from '@/composables/usePowerUps'
import { fireConfetti, playSfx } from '@/utils/effects'

const packStore = usePackStore()
const teamStore = useTeamStore()
const quiz = computed(()=> (packStore.overrides['quiz'] as any) ?? quizSeed)
const idx = ref(Math.floor(Math.random()* (quiz.value.length || 1)))
const chosen = ref<number | null>(null)
const revealed = ref(false)
const timer = useTimer(15)
const cur = computed(()=> quiz.value[idx.value])
const hiddenOptions = ref<Set<number>>(new Set())
const toastXp = ref(0)
const showToast = ref(false)
const showBonus = ref(false)
const power = usePowerUps()

function startQ(){ chosen.value=null; revealed.value=false; hiddenOptions.value=new Set(); timer.start(15) }
function choose(i:number){ if(revealed.value) return; chosen.value=i }
function submit(){
  if(chosen.value===null) return
  revealed.value=true; timer.stop()
  const correct = checkAnswer(cur.value, chosen.value)
  if(correct){
    let base=xpFor(true, timer.remaining.value, timer.total.value, 15)
    if(power.consumeDouble()) base*=2
    const sb=streakBonus(teamStore.getStreak(teamStore.activeId))
    teamStore.addScoreWithStreak(teamStore.activeId, base, sb)
    toastXp.value=base+sb; showToast.value=false; setTimeout(()=> showToast.value=true, 10)
    fireConfetti(); playSfx('correct')
    if(teamStore.getStreak(teamStore.activeId)>=3) showBonus.value=true
  } else { teamStore.resetStreak(teamStore.activeId); playSfx('wrong') }
}
function next(){ idx.value=pickRandomIndexExcluding(quiz.value.length, idx.value); teamStore.nextTurn(); startQ() }
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
function doFreeze(){ if(power.useFreeze()){ timer.stop(); setTimeout(()=> timer.start(timer.remaining.value), 5000) } }
function doFifty(){
  if(!power.useFifty()) return
  const wrong = cur.value.options.map((_:any,i:number)=>i).filter((i:number)=> i!==cur.value.answerIndex)
  const toHide = wrong.sort(()=> Math.random()-0.5).slice(0,2)
  hiddenOptions.value=new Set(toHide)
}

startQ()
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <PowerUpsBar :doubleUsed="power.doubleUsed.value" :freezeUsed="power.freezeUsed.value" :fiftyUsed="power.fiftyUsed.value" :canFifty="true" @double="power.useDouble()" @freeze="doFreeze" @fifty="doFifty" />
    <XpToast :xp="toastXp" :show="showToast" />
    <BonusSpin v-if="showBonus" @award="onBonus" @close="showBonus=false" />
    <div class="flex justify-between items-center">
      <span class="font-black text-sm text-duo-text-light">Q {{ idx+1 }} / {{ quiz.length }} · {{ cur.category }}</span>
      <span class="font-black text-duo-red text-sm">{{ timer.remaining.value }}s</span>
    </div>
    <ProgressBar :value="timer.remaining.value" :max="timer.total.value" color="#FF4B4B" />
    <DuoCard>
      <h2 class="text-xl font-black text-duo-text">{{ cur.question }}</h2>
      <div class="grid gap-2 mt-4">
        <button
          v-for="(o,i) in cur.options" :key="i"
          v-show="!hiddenOptions.has(Number(i))"
          @click="choose(Number(i))"
          :class="['text-left font-bold rounded-2xl border-2 p-4 transition-all', chosen===Number(i) ? 'border-duo-blue bg-blue-50' : 'border-duo-gray bg-white hover:border-duo-gray-dark', revealed && Number(i)===cur.answerIndex ? '!border-duo-green !bg-green-50' : '', revealed && chosen===Number(i) && Number(i)!==cur.answerIndex ? '!border-duo-red !bg-red-50' : '']"
          :data-testid="`opt-${i}`"
        >{{ String.fromCharCode(65+Number(i)) }}. {{ o }}</button>
      </div>
      <p v-if="revealed && cur.explain" class="mt-3 text-sm font-bold bg-duo-gray-light rounded-xl p-3">💡 {{ cur.explain }}</p>
      <div class="mt-4 flex gap-3">
        <DuoButton v-if="!revealed" @click="submit" :disabled="chosen===null" data-testid="submit-btn">CHECK</DuoButton>
        <DuoButton v-else variant="secondary" @click="next" data-testid="next-btn">NEXT →</DuoButton>
        <DuoButton variant="outline" @click="next">Skip</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
