<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { wordSortSeed } from '@/data/seed'
import { checkPlacements } from './logic'
import { xpFor, streakBonus } from '@/composables/useScore'
import { useTimer } from '@/composables/useTimer'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'

const packStore = usePackStore()
const teamStore = useTeamStore()
const list = computed(()=> (packStore.overrides['word-sort'] as any) ?? wordSortSeed)
const idx = ref(Math.floor(Math.random()* (list.value.length || 1)))
const cur = computed(()=> list.value[idx.value])
const placements = reactive<Record<string, number>>({})
const revealed = ref(false)
const timer = useTimer(60)
function start(){ Object.keys(placements).forEach(k=>delete placements[k]); revealed.value=false; timer.start(60) }
start()
function place(word:string, bucket:number){ if(revealed.value) return; placements[word]=bucket }
function submit(){
  revealed.value=true; timer.stop()
  const r=checkPlacements(cur.value, placements)
  const correct=r.correct===r.total
  if(correct){
    const base=xpFor(true, timer.remaining.value, timer.total.value, 15)
    teamStore.addScoreWithStreak(teamStore.activeId, base, streakBonus(teamStore.getStreak(teamStore.activeId)))
  } else teamStore.resetStreak(teamStore.activeId)
}
function next(){ idx.value=pickRandomIndexExcluding(list.value.length, idx.value); teamStore.nextTurn(); start() }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm"><span>Sort words · {{ idx+1 }}/{{ list.length }}</span><span :class="timer.remaining.value<=10?'text-duo-red animate-pulse':''">{{ timer.remaining.value }}s</span></div>
    <ProgressBar :value="timer.remaining.value" :max="timer.total.value" :color="timer.remaining.value>30?'#58CC02':timer.remaining.value>10?'#FFC800':'#FF4B4B'" />
    <DuoCard>
      <div class="grid md:grid-cols-3 gap-3">
        <div v-for="(b,bi) in cur.buckets" :key="bi" class="bg-duo-gray-light rounded-2xl p-3 border-2 border-duo-gray min-h-32">
          <p class="font-black text-center text-sm text-duo-blue">{{ b }}</p>
          <div class="mt-2 space-y-2">
            <div v-for="w in cur.words.filter((x:any)=> placements[x.text]===bi)" :key="w.text" class="bg-white rounded-xl border-2 p-2 font-bold text-sm flex justify-between" :class="revealed ? (w.bucketIndex===bi ? 'border-duo-green bg-green-50' : 'border-duo-red bg-red-50') : 'border-duo-gray'">
              {{ w.text }} <button v-if="!revealed" @click="delete placements[w.text]" class="text-duo-red">✕</button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mt-4">
        <template v-for="w in cur.words" :key="w.text">
          <button v-if="placements[w.text]===undefined" @click="place(w.text,0)" class="bg-white border-2 border-duo-gray rounded-xl px-3 py-2 font-bold">{{ w.text }}→</button>
        </template>
      </div>
      <p class="text-xs font-bold text-duo-text-light mt-2">Tap word to place in first bucket, then move via bucket (demo: tap word then you can delete and re-place). Teacher: use CHECK.</p>
      <div class="flex gap-2 mt-3">
        <span v-for="(b,bi) in cur.buckets" :key="bi" class="flex gap-1">
          <DuoButton size="sm" variant="outline" v-for="w in cur.words.filter((x:any)=> placements[x.text]===undefined)" :key="w.text" @click="place(w.text,Number(bi))">{{ w.text }}→{{ b }}</DuoButton>
        </span>
      </div>
      <div v-if="revealed" class="mt-3 font-black text-center" :class="checkPlacements(cur, placements).correct===cur.words.length ? 'text-duo-green' : 'text-duo-red'">
        {{ checkPlacements(cur, placements).correct }}/{{ cur.words.length }} correct <span v-if="checkPlacements(cur, placements).correct===cur.words.length">+{{ xpFor(true, timer.remaining.value, timer.total.value, 15) }} XP</span>
      </div>
      <div class="flex gap-2 mt-4">
        <DuoButton v-if="!revealed" @click="submit" data-testid="check-btn">CHECK</DuoButton>
        <DuoButton v-else variant="secondary" @click="next">NEXT →</DuoButton>
        <DuoButton variant="outline" @click="start">Clear</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
