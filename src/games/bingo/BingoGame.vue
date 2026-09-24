<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { bingoSeed } from '@/data/seed'
import { makeBoard, checkBingo, drawNext } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
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
const pool = computed(()=> (packStore.overrides['bingo'] as any) ?? bingoSeed)
const board = ref(makeBoard(pool.value,3))
const drawn = ref<Set<string>>(new Set())
const current = ref<any>(null)
const auto = ref(false)
let iid:any=null
const won = computed(()=> checkBingo(board.value, drawn.value))
function draw(){
  const n=drawNext(pool.value, drawn.value)
  if(n){ drawn.value.add(n.id); current.value=n }
  if(won.value){ stopAuto(); teamStore.addScoreWithStreak(teamStore.activeId, 20, 0) }
}
function startAuto(){ if(auto.value) return; auto.value=true; iid=setInterval(draw, 3000) }
function stopAuto(){ auto.value=false; if(iid) clearInterval(iid) }
function reset(){ board.value=makeBoard(pool.value,3); drawn.value=new Set(); current.value=null; stopAuto() }
function doFreeze(){}
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <DuoCard class="text-center">
      <p class="font-black text-duo-text">BINGO — Teacher draws words, students shout!</p>
      <p v-if="current" class="mt-2 text-xl font-black text-duo-blue">Drawn: {{ current.word }} <span class="text-sm text-duo-text-light">— {{ current.definition }}</span></p>
      <div class="grid grid-cols-3 gap-2 mt-4 max-w-sm mx-auto">
        <div v-for="cell in board" :key="cell.id" :class="['h-20 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black p-2 text-center', drawn.has(cell.id) ? 'bg-duo-green text-white border-duo-green-shadow' : 'bg-white border-duo-gray']">{{ cell.word }}</div>
      </div>
      <p v-if="won" class="mt-4 text-2xl font-black text-duo-green">🎉 BINGO! +20 XP to {{ teamStore.teams.find(t=>t.id===teamStore.activeId)?.name }}</p>
      <div class="flex justify-center gap-2 mt-4 flex-wrap">
        <DuoButton @click="draw" data-testid="draw-btn">DRAW</DuoButton>
        <DuoButton :variant="auto?'danger':'secondary'" @click="auto?stopAuto():startAuto()">{{ auto?'Stop Auto':'Auto 3s' }}</DuoButton>
        <DuoButton variant="outline" @click="reset">New Board</DuoButton>
      </div>
      <p class="text-xs font-bold text-duo-text-light mt-2">Drawn {{ drawn.size }} / {{ pool.length }}</p>
    </DuoCard>
  </div>
</template>
