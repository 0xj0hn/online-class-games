<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { oddOneOutSeed } from '@/data/seed'
import { isCorrect } from './logic'
import { xpFor, streakBonus } from '@/composables/useScore'
import { useTimer } from '@/composables/useTimer'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'

const packStore = usePackStore()
const teamStore = useTeamStore()
const list = computed(()=> (packStore.overrides['odd-one-out'] as any) ?? oddOneOutSeed)
const idx = ref(Math.floor(Math.random()* (list.value.length || 1)))
const cur = computed(()=> list.value[idx.value])
const chosen = ref<number|null>(null)
const revealed = ref(false)
const timer = useTimer(20)
function start(){ chosen.value=null; revealed.value=false; timer.start(20) }
start()
function choose(i:number){ if(revealed.value) return; chosen.value=i }
function submit(){
  if(chosen.value===null) return
  revealed.value=true; timer.stop()
  const correct=isCorrect(cur.value, chosen.value)
  if(correct){
    const base=xpFor(true, timer.remaining.value, timer.total.value, 10)
    const sb=streakBonus(teamStore.getStreak(teamStore.activeId))
    teamStore.addScoreWithStreak(teamStore.activeId, base, sb)
  } else teamStore.resetStreak(teamStore.activeId)
}
function next(){ idx.value=pickRandomIndexExcluding(list.value.length, idx.value); teamStore.nextTurn(); start() }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm">
      <span class="text-duo-text-light">{{ cur.category }} · {{ idx+1 }}/{{ list.length }}</span>
      <span :class="timer.remaining.value<=5 ? 'text-duo-red animate-pulse' : 'text-duo-text-light'">{{ timer.remaining.value }}s</span>
    </div>
    <ProgressBar :value="timer.remaining.value" :max="timer.total.value" :color="timer.remaining.value>10 ? '#58CC02' : timer.remaining.value>5 ? '#FFC800' : '#FF4B4B'" />
    <DuoCard>
      <h2 class="font-black text-duo-text text-center">Which one is different?</h2>
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button v-for="(o,i) in cur.options" :key="i" @click="choose(Number(i))" :class="['p-4 rounded-2xl border-2 border-b-4 font-black text-lg', chosen===Number(i) ? 'border-duo-blue bg-blue-50' : 'bg-white border-duo-gray', revealed && Number(i)===cur.answerIndex ? '!border-duo-green !bg-green-50' : '', revealed && chosen===Number(i) && Number(i)!==cur.answerIndex ? '!border-duo-red !bg-red-50' : '']" :data-testid="`opt-${i}`">{{ o }}</button>
      </div>
      <div v-if="revealed" class="mt-3 p-3 rounded-xl font-bold text-sm" :class="isCorrect(cur, chosen!) ? 'bg-green-50 border-2 border-duo-green text-duo-green' : 'bg-red-50 border-2 border-duo-red text-duo-red'">
        {{ isCorrect(cur, chosen!) ? '✅ Correct!' : '❌ Wrong' }} — {{ cur.reason }}
        <span v-if="isCorrect(cur, chosen!)"> +{{ xpFor(true, timer.remaining.value, timer.total.value, 10) }} XP <span v-if="teamStore.getStreak(teamStore.activeId)>1" class="bg-duo-yellow text-white px-2 rounded-full">×{{ teamStore.getStreak(teamStore.activeId) }} streak +{{ streakBonus(teamStore.getStreak(teamStore.activeId)-1) }}</span></span>
      </div>
      <div class="flex gap-2 mt-4">
        <DuoButton v-if="!revealed" @click="submit" :disabled="chosen===null" data-testid="check-btn">CHECK</DuoButton>
        <DuoButton v-else variant="secondary" @click="next" data-testid="next-btn">NEXT →</DuoButton>
        <DuoButton variant="outline" @click="next">Skip</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
