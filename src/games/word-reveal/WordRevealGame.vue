<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { revealSeed } from '@/data/seed'
import { xpForStage, nextStage } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import { fireConfetti, playSfx } from '@/utils/effects'
import { usePowerUps } from '@/composables/usePowerUps'
import PowerUpsBar from '@/components/shared/PowerUpsBar.vue'
import XpToast from '@/components/shared/XpToast.vue'
import BonusSpin from '@/components/shared/BonusSpin.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'

const packStore = usePackStore()
const teamStore = useTeamStore()
const power = usePowerUps()
const toastXp = ref(0)
const showToast = ref(false)
const showBonus = ref(false)
const items = computed(()=> (packStore.overrides['reveal'] as any) ?? revealSeed)
const idx = ref(Math.floor(Math.random()* (items.value.length || 1)))
const stage = ref(0)
const cur = computed(()=> items.value[idx.value])
const blur = computed(()=> [24,16,8,2,0][stage.value])
function reveal(){ stage.value=nextStage(stage.value) }
function next(){ idx.value=pickRandomIndexExcluding(items.value.length, idx.value); stage.value=0 }
function correct(){
  teamStore.addScore(teamStore.activeId, xpForStage(stage.value))
  teamStore.nextTurn()
  next()
}
function doFreeze(){}
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <DuoCard class="text-center">
      <div class="relative overflow-hidden rounded-2xl border-2 border-duo-gray bg-duo-gray-light">
        <img :src="cur.image" :alt="cur.word" class="w-full h-72 object-cover transition-all duration-500" :style="{ filter: `blur(${blur}px)` }" data-testid="reveal-img" />
        <div class="absolute inset-0 bg-white/10"></div>
        <div class="absolute bottom-2 left-2 bg-black/60 text-white font-black px-3 py-1 rounded-full text-xs">Stage {{ stage }}/4 · blur {{ blur }}px</div>
      </div>
      <p class="mt-3 font-black text-duo-text">{{ stage>=4 ? cur.word : '???' }} <span class="text-duo-text-light text-sm">— {{ cur.hint }}</span></p>
      <div class="mt-4 flex justify-center gap-3 flex-wrap">
        <DuoButton variant="yellow" @click="reveal" :disabled="stage>=4" data-testid="reveal-btn">👁️ REVEAL ({{ 4-stage }} left)</DuoButton>
        <DuoButton @click="correct" data-testid="correct-btn">✅ Correct +{{ xpForStage(stage) }} XP ({{ teamStore.teams.find(t=>t.id===teamStore.activeId)?.name }})</DuoButton>
        <DuoButton variant="outline" @click="next">Skip →</DuoButton>
      </div>
      <p class="text-xs font-bold text-duo-text-light mt-2">Faster guess = more XP (Stage 1:20, 2:15, 3:10, 4:5)</p>
    </DuoCard>
  </div>
</template>
