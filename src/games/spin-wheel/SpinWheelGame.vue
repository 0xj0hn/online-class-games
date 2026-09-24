<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import { usePackStore } from '@/stores/packStore'
import { topicsSeed } from '@/data/seed'
import { spinTopics } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
import DuoCard from '@/components/ui/DuoCard.vue'
import { fireConfetti, playSfx } from '@/utils/effects'
import { usePowerUps } from '@/composables/usePowerUps'
import PowerUpsBar from '@/components/shared/PowerUpsBar.vue'
import XpToast from '@/components/shared/XpToast.vue'
import BonusSpin from '@/components/shared/BonusSpin.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'

const teamStore = useTeamStore()
const power = usePowerUps()
const toastXp = ref(0)
const showToast = ref(false)
const showBonus = ref(false)
const packStore = usePackStore()
const topics = computed(()=> (packStore.overrides['topics'] as any) ?? topicsSeed)
const current = ref<any>(null)
const spinning = ref(false)
const angle = ref(0)
function spin(){
  spinning.value=true
  angle.value += 720 + Math.random()*720
  setTimeout(()=>{
    current.value = spinTopics(topics.value)
    spinning.value=false
  }, 800)
}
function award(){
  if(!current.value) return
  teamStore.addScore(teamStore.activeId, 10)
  teamStore.nextTurn()
  current.value=null
}
function doFreeze(){}
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <DuoCard class="text-center py-8">
      <div class="mx-auto w-52 h-52 rounded-full border-[8px] border-duo-yellow bg-duo-yellow/20 flex items-center justify-center text-6xl transition-transform duration-700" :style="{transform: `rotate(${angle}deg)`}" data-testid="wheel">🎡</div>
      <div class="mt-6 flex justify-center gap-3">
        <DuoButton variant="yellow" @click="spin" :disabled="spinning" data-testid="spin-btn">{{ spinning ? 'Spinning...' : 'SPIN' }}</DuoButton>
        <DuoButton variant="outline" @click="current=null" v-if="current">Skip</DuoButton>
      </div>
    </DuoCard>
    <DuoCard v-if="current" class="border-duo-yellow bg-yellow-50" data-testid="prompt-card">
      <p class="text-xs font-black tracking-widest text-duo-yellow-dark uppercase">{{ current.category }} · {{ current.level }}</p>
      <p class="text-2xl font-black text-duo-text mt-2">{{ current.text }}</p>
      <div class="mt-4 flex gap-3">
        <DuoButton @click="award" data-testid="correct-btn">✅ Correct +10 XP ({{ teamStore.teams.find(t=>t.id===teamStore.activeId)?.name }})</DuoButton>
        <DuoButton variant="outline" @click="teamStore.nextTurn()">Next Team</DuoButton>
      </div>
    </DuoCard>
    <p v-else class="text-center font-bold text-duo-text-light">Spin to get a speaking prompt. Students talk 30 seconds.</p>
  </div>
</template>
