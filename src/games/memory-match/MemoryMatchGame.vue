<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { pairsSeed } from '@/data/seed'
import { makeCards, isMatch } from './logic'
import { shuffle } from '@/utils/random'
import DuoButton from '@/components/ui/DuoButton.vue'
import { fireConfetti, playSfx } from '@/utils/effects'
import { usePowerUps } from '@/composables/usePowerUps'
import PowerUpsBar from '@/components/shared/PowerUpsBar.vue'
import XpToast from '@/components/shared/XpToast.vue'
import BonusSpin from '@/components/shared/BonusSpin.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import type { Card } from './logic'

const packStore = usePackStore()
const teamStore = useTeamStore()
const power = usePowerUps()
const toastXp = ref(0)
const showToast = ref(false)
const showBonus = ref(false)
const pairs = computed(()=> { const pool=(packStore.overrides['pairs'] as any) ?? pairsSeed as any; const shuffled=shuffle(pool as any); return shuffled.slice(0, Math.min(6, pool.length)) as any })
const cards = ref<Card[]>(makeCards(pairs.value as any))
const flipped = ref<Card[]>([])
const matched = ref<Set<string>>(new Set())
const moves = ref(0)

function flip(c: Card){
  if(flipped.value.length>=2 || matched.value.has(c.uid) || flipped.value.find(x=>x.uid===c.uid)) return
  flipped.value.push(c)
  if(flipped.value.length===2){
    moves.value++
    const [a,b]=flipped.value
    if(isMatch(a,b)){
      matched.value.add(a.uid); matched.value.add(b.uid)
      if(matched.value.size===cards.value.length){
        fireConfetti(); playSfx('correct'); teamStore.addScore(teamStore.activeId, 20 - Math.min(10, moves.value))
      }
      flipped.value=[]
    } else {
      setTimeout(()=> flipped.value=[], 900)
    }
  }
}
function reset(){ const pool=(packStore.overrides['pairs'] as any) ?? pairsSeed as any; const shuffled=shuffle(pool as any); const sel=shuffled.slice(0, Math.min(6, pool.length)) as any; cards.value=makeCards(sel as any); flipped.value=[]; matched.value=new Set(); moves.value=0 }
function doFreeze(){}
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm">
      <span>Moves: {{ moves }}</span><span>Matched: {{ matched.size/2 }} / {{ cards.length/2 }}</span>
    </div>
    <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
      <button
        v-for="c in cards" :key="c.uid"
        @click="flip(c)"
        :class="['h-24 rounded-2xl border-2 font-bold text-sm p-2 transition-all', matched.has(c.uid) ? 'bg-duo-green text-white border-duo-green-shadow' : flipped.find(x=>x.uid===c.uid) ? 'bg-white border-duo-blue' : 'bg-duo-blue text-white border-duo-blue-shadow']"
        :data-testid="`card-${c.uid}`"
      >
        <span v-if="matched.has(c.uid) || flipped.find(x=>x.uid===c.uid)">{{ c.label }}</span>
        <span v-else>?</span>
      </button>
    </div>
    <DuoButton variant="outline" @click="reset">Shuffle</DuoButton>
    <p v-if="matched.size===cards.length" class="text-center font-black text-duo-green text-xl">🎉 All matched! +XP awarded</p>
  </div>
</template>
