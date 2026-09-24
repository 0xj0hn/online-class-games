<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { emojiStorySeed } from '@/data/seed'
import { checkOrder, shuffleWords } from './logic'
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
const list = computed(()=> (packStore.overrides['emoji-story'] as any) ?? emojiStorySeed)
const idx = ref(Math.floor(Math.random()* (list.value.length || 1)))
const cur = computed(()=> list.value[idx.value])
const pool = ref<string[]>([])
const answer = ref<string[]>([])
const revealed = ref(false)
const ok = ref(false)
const timer = useTimer(45)
function init(){
  pool.value=shuffleWords([...cur.value.answer]); answer.value=[]; revealed.value=false; timer.start(45)
}
init()
function toAns(w:string,i:number){ pool.value.splice(i,1); answer.value.push(w) }
function toPool(w:string,i:number){ answer.value.splice(i,1); pool.value.push(w) }
function check(){
  revealed.value=true; timer.stop()
  ok.value=checkOrder(cur.value.answer, answer.value)
  if(ok.value){ const base=xpFor(true,timer.remaining.value,timer.total.value,15); teamStore.addScoreWithStreak(teamStore.activeId, base, streakBonus(teamStore.getStreak(teamStore.activeId))) } else teamStore.resetStreak(teamStore.activeId)
}
function next(){ idx.value=pickRandomIndexExcluding(list.value.length, idx.value); teamStore.nextTurn(); init() }

function doFreeze(){ if(power.useFreeze()){ timer.stop(); setTimeout(()=> timer.start(timer.remaining.value), 5000) } }
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm"><span>{{ cur.hint }} · {{ idx+1 }}/{{ list.length }}</span><span>{{ timer.remaining.value }}s</span></div>
    <ProgressBar :value="timer.remaining.value" :max="timer.total.value" color="#FF9600" />
    <DuoCard class="text-center">
      <p class="text-6xl">{{ cur.emojis }}</p>
      <div class="min-h-16 border-2 border-dashed border-duo-gray rounded-2xl p-3 flex flex-wrap gap-2 mt-4 bg-duo-gray-light justify-center">
        <button v-for="(w,i) in answer" :key="i" @click="toPool(w,i)" class="bg-white border-2 rounded-xl px-3 py-2 font-bold">{{ w }}</button>
        <span v-if="!answer.length" class="text-duo-text-light font-bold">Tap words</span>
      </div>
      <div class="flex flex-wrap gap-2 justify-center mt-4">
        <button v-for="(w,i) in pool" :key="i" @click="toAns(w,i)" class="bg-duo-blue text-white border-b-4 border-duo-blue-shadow rounded-xl px-4 py-2 font-black">{{ w }}</button>
      </div>
      <div v-if="revealed" :class="['mt-3 font-black', ok?'text-duo-green':'text-duo-red']">{{ ok ? `✅ +${xpFor(true,timer.remaining.value,timer.total.value,15)} XP` : `❌ ${cur.answer.join(' ')}` }}</div>
      <div class="flex justify-center gap-3 mt-4">
        <DuoButton @click="check" v-if="!revealed" data-testid="check-btn">CHECK</DuoButton>
        <DuoButton variant="secondary" v-else @click="next">NEXT →</DuoButton>
        <DuoButton variant="outline" @click="init">Clear</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
