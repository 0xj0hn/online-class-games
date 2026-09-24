<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { sentencesSeed } from '@/data/seed'
import { checkOrder, shuffleWords } from './logic'
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
const sentences = computed(()=> (packStore.overrides['sentences'] as any) ?? sentencesSeed)
const idx = ref(Math.floor(Math.random()* (sentences.value.length || 1)))
const cur = computed(()=> sentences.value[idx.value])
const pool = ref<string[]>([])
const answer = ref<string[]>([])
const result = ref<null | boolean>(null)
function init(){
  const words=[...cur.value.sentence, ...(cur.value.distractors||[])]
  pool.value=shuffleWords(words)
  answer.value=[]; result.value=null
}
init()
function toAnswer(w:string, i:number){ pool.value.splice(i,1); answer.value.push(w) }
function toPool(w:string, i:number){ answer.value.splice(i,1); pool.value.push(w) }
function check(){
  const ok=checkOrder(cur.value.sentence, answer.value)
  result.value=ok
  if(ok) teamStore.addScore(teamStore.activeId, 15)
}
function next(){ idx.value=pickRandomIndexExcluding(sentences.value.length, idx.value); init() }
function doFreeze(){}
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <DuoCard>
      <p class="text-xs font-black tracking-widest uppercase text-duo-text-light">Build the sentence · {{ idx+1 }}/{{ sentences.length }}</p>
      <div class="min-h-20 border-2 border-dashed border-duo-gray rounded-2xl p-3 flex flex-wrap gap-2 mt-3 bg-duo-gray-light">
        <button v-for="(w,i) in answer" :key="'a'+i" @click="toPool(w,i)" class="bg-white border-2 border-duo-gray rounded-xl px-3 py-2 font-bold shadow-sm">{{ w }}</button>
        <span v-if="!answer.length" class="text-duo-text-light font-bold self-center">Tap words below</span>
      </div>
      <div class="flex flex-wrap gap-2 mt-4">
        <button v-for="(w,i) in pool" :key="'p'+i" @click="toAnswer(w,i)" class="bg-duo-blue text-white border-b-4 border-duo-blue-shadow rounded-xl px-4 py-2 font-black">{{ w }}</button>
      </div>
      <p v-if="cur.hint" class="text-sm font-bold text-duo-text-light mt-2">Hint: {{ cur.hint }}</p>
      <div v-if="result!==null" :class="['mt-3 p-3 rounded-xl font-black text-center', result ? 'bg-green-100 text-duo-green border-2 border-duo-green' : 'bg-red-100 text-duo-red border-2 border-duo-red']">
        {{ result ? '✅ Correct! +15 XP' : '❌ Try again' }}
      </div>
      <div class="mt-4 flex gap-3">
        <DuoButton @click="check" :disabled="!answer.length" data-testid="check-btn">CHECK</DuoButton>
        <DuoButton variant="outline" @click="init">Clear</DuoButton>
        <DuoButton variant="secondary" @click="next">Next →</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
