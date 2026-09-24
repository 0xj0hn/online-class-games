<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { hangmanSeed } from '@/data/seed'
import { makeState, guess, displayWord, isWon, isLost } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'

const packStore = usePackStore()
const teamStore = useTeamStore()
const items = computed(()=> (packStore.overrides['hangman'] as any) ?? hangmanSeed)
const idx = ref(Math.floor(Math.random()* (items.value.length || 1)))
const state = ref(makeState(items.value[idx.value].word))
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
function init(){ state.value=makeState(items.value[idx.value].word) }
function doGuess(l:string){ guess(state.value,l) }
const won = computed(()=> isWon(state.value))
const lost = computed(()=> isLost(state.value))
function next(){ idx.value=pickRandomIndexExcluding(items.value.length, idx.value); init() }
// award on win
import { watch } from 'vue'
watch(won, v=>{ if(v) teamStore.addScore(teamStore.activeId, 15)})
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <DuoCard class="text-center">
      <p class="text-xs font-black tracking-widest uppercase text-duo-text-light">{{ items[idx].hint }}</p>
      <p class="text-3xl font-black tracking-widest text-duo-text mt-3" data-testid="display-word">{{ displayWord(state) }}</p>
      <p class="mt-2 font-bold">
        <span v-for="n in 6" :key="n" :class="['inline-block w-6 h-6 rounded-full mx-1', n<=state.lives ? 'bg-duo-red' : 'bg-duo-gray']">♥</span>
        <span class="ml-2 text-duo-red">{{ state.lives }} lives</span>
      </p>
      <div class="grid grid-cols-7 gap-2 mt-6">
        <button
          v-for="l in letters" :key="l"
          @click="doGuess(l)"
          :disabled="state.guessed.has(l) || won || lost"
          :class="['rounded-xl border-2 border-b-4 font-black py-2', state.guessed.has(l) ? (items[idx].word.includes(l) ? 'bg-duo-green text-white border-duo-green-shadow' : 'bg-duo-gray text-duo-text-light border-duo-gray-dark') : 'bg-white border-duo-gray hover:border-duo-gray-dark']"
          :data-testid="`key-${l}`"
        >{{ l }}</button>
      </div>
      <div v-if="won" class="mt-4 font-black text-duo-green text-xl">🎉 You won! +15 XP</div>
      <div v-if="lost" class="mt-4 font-black text-duo-red">💀 Word was {{ items[idx].word }}</div>
      <div class="mt-4 flex justify-center gap-3">
        <DuoButton variant="secondary" @click="next">Next word →</DuoButton>
        <DuoButton variant="outline" @click="init">Reset</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
