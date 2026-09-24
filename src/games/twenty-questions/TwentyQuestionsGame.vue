<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { twentyQSeed } from '@/data/seed'
import { makeState, ask, guess, isOver } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'
const packStore = usePackStore()
const teamStore = useTeamStore()
const list = computed(()=> (packStore.overrides['twenty-questions'] as any) ?? twentyQSeed)
const idx = ref(Math.floor(Math.random()* (list.value.length || 1)))
const state = ref(makeState(list.value[idx.value].secret, list.value[idx.value].hints))
const question = ref('')
const guessInput = ref('')
const result = ref<null|boolean>(null)
function init(){ state.value=makeState(list.value[idx.value].secret, list.value[idx.value].hints); question.value=''; guessInput.value=''; result.value=null }
function doAsk(){ if(!question.value) return; ask(state.value, question.value); question.value='' }
function doGuess(){
  const ok=guess(state.value, guessInput.value)
  result.value=ok
  if(ok){ const bonus=Math.floor(state.value.remaining/2); teamStore.addScoreWithStreak(teamStore.activeId, 20+bonus, 0) }
  else if(isOver(state.value)) result.value=false
}
function next(){ idx.value=pickRandomIndexExcluding(list.value.length, idx.value); teamStore.nextTurn(); init() }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm"><span>{{ list[idx].category }} · {{ idx+1 }}/{{ list.length }}</span><span :class="state.remaining<=5?'text-duo-red':''">{{ state.remaining }} left</span></div>
    <ProgressBar :value="state.remaining" :max="20" color="#CE82FF" />
    <DuoCard>
      <p class="font-black text-center text-duo-text">Secret: {{ result===true ? state.secret : '???' }} (teacher sees: {{ state.secret }})</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <span v-for="(h,i) in state.hints.slice(0, state.revealedHints)" :key="i" class="bg-duo-yellow text-white font-bold px-3 py-1 rounded-full text-xs">Hint {{i+1}}: {{ h }}</span>
        <span v-if="state.revealedHints===0" class="text-xs font-bold text-duo-text-light">Hints appear at 13 & 6 left</span>
      </div>
      <div class="mt-4 space-y-2 max-h-32 overflow-auto bg-duo-gray-light rounded-xl p-3">
        <div v-for="(q,i) in state.asked" :key="i" class="font-bold text-sm">Q{{i+1}}: {{ q }}</div>
        <span v-if="!state.asked.length" class="text-sm font-bold text-duo-text-light">No questions yet — students ask via mic, teacher types here</span>
      </div>
      <div class="flex gap-2 mt-3">
        <input v-model="question" placeholder="Type question (Is it...?)" class="flex-1 border-2 border-duo-gray rounded-xl px-3 py-2 font-bold outline-none focus:border-duo-blue" />
        <DuoButton size="sm" @click="doAsk" :disabled="!question">Ask -1</DuoButton>
      </div>
      <div class="flex gap-2 mt-3">
        <input v-model="guessInput" placeholder="Guess secret" class="flex-1 border-2 border-duo-gray rounded-xl px-3 py-2 font-bold outline-none focus:border-duo-blue" data-testid="guess-input" />
        <DuoButton @click="doGuess" data-testid="guess-btn">GUESS</DuoButton>
      </div>
      <div v-if="result!==null" :class="['mt-3 font-black text-center p-2 rounded-xl', result?'bg-green-50 border-2 border-duo-green text-duo-green':'bg-red-50 border-2 border-duo-red text-duo-red']">
        {{ result ? `🎉 Correct! +${20+Math.floor(state.remaining/2)} XP` : isOver(state) ? `💀 Game Over — was ${state.secret}` : '❌ Wrong, keep asking' }}
      </div>
      <div class="flex gap-2 mt-4">
        <DuoButton variant="secondary" @click="next">Next Secret →</DuoButton>
        <DuoButton variant="outline" @click="init">Reset</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
