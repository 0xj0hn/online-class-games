<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { anagramSeed } from '@/data/seed'
import { scramble, checkAnswer } from './logic'
import { xpFor, streakBonus } from '@/composables/useScore'
import { useTimer } from '@/composables/useTimer'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import { fireConfetti, playSfx } from '@/utils/effects'
import { usePowerUps } from '@/composables/usePowerUps'
import PowerUpsBar from '@/components/shared/PowerUpsBar.vue'
import XpToast from '@/components/shared/XpToast.vue'
import BonusSpin from '@/components/shared/BonusSpin.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'

const packStore = usePackStore()
const teamStore = useTeamStore()
const power = usePowerUps()
const toastXp = ref(0)
const showToast = ref(false)
const showBonus = ref(false)
const list = computed(()=> (packStore.overrides['anagram'] as any) ?? anagramSeed)
const idx = ref(Math.floor(Math.random()* (list.value.length || 1)))
const cur = computed(()=> list.value[idx.value])
const scrambled = computed(()=> scramble(cur.value.word))
const input = ref('')
const revealed = ref(false)
const ok = ref(false)
const timer = useTimer(30)
function start(){ input.value=''; revealed.value=false; timer.start(30) }
start()
function submit(){
  revealed.value=true; timer.stop()
  ok.value=checkAnswer(cur.value.word, input.value)
  if(ok.value){ const base=xpFor(true, timer.remaining.value, timer.total.value, 10); teamStore.addScoreWithStreak(teamStore.activeId, base, streakBonus(teamStore.getStreak(teamStore.activeId))) } else teamStore.resetStreak(teamStore.activeId)
}
function next(){ idx.value=pickRandomIndexExcluding(list.value.length, idx.value); teamStore.nextTurn(); start() }

function doFreeze(){ if(power.useFreeze()){ timer.stop(); setTimeout(()=> timer.start(timer.remaining.value), 5000) } }
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm"><span>Unscramble · {{ idx+1 }}/{{ list.length }} · {{ cur.hint }}</span><span :class="timer.remaining.value<=5?'text-duo-red animate-pulse':''">{{ timer.remaining.value }}s</span></div>
    <ProgressBar :value="timer.remaining.value" :max="timer.total.value" color="#58CC02" />
    <DuoCard class="text-center py-8">
      <p class="text-4xl font-black tracking-widest text-duo-blue">{{ scrambled }}</p>
      <input v-model="input" placeholder="Type answer" class="mt-6 w-full max-w-sm mx-auto border-2 border-duo-gray rounded-2xl px-4 py-3 font-bold text-center outline-none focus:border-duo-blue" data-testid="anagram-input" />
      <div v-if="revealed" :class="['mt-4 font-black', ok?'text-duo-green':'text-duo-red']">{{ ok ? `✅ ${cur.word} +${xpFor(true,timer.remaining.value,timer.total.value,10)} XP` : `❌ Was ${cur.word}` }}</div>
      <div class="flex justify-center gap-3 mt-6">
        <DuoButton v-if="!revealed" @click="submit" data-testid="check-btn">CHECK</DuoButton>
        <DuoButton v-else variant="secondary" @click="next">NEXT →</DuoButton>
        <DuoButton variant="outline" @click="next">Skip</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
