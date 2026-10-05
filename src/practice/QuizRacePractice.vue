<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { quizSeed } from '@/data/seed'
import { checkAnswer } from '@/games/quiz-race/logic'
import { shuffle } from '@/utils/random'
import { fireConfetti, playSfx } from '@/utils/effects'
import DuoCard from '@/components/ui/DuoCard.vue'
import DuoButton from '@/components/ui/DuoButton.vue'

const props = defineProps<{ round: number }>()
const emit = defineEmits<{ (e: 'record', ok: boolean): void }>()

const packStore = usePackStore()
const pool = computed<any[]>(()=> (packStore.overrides['quiz'] as any) ?? quizSeed)
const order = ref<number[]>([])
const pos = ref(0)
const chosen = ref<number|null>(null)
const revealed = ref(false)

function build() {
  order.value = shuffle([...Array(pool.value.length).keys()])
  pos.value = 0
  chosen.value = null
  revealed.value = false
}
watch(()=> props.round, build, { immediate:true })
watch(pool, build)

const item = computed<any>(()=> pool.value[order.value[pos.value]])
const atEnd = computed(()=> !order.value.length || pos.value>=order.value.length-1)

function choose(i: number) { if(!revealed.value) chosen.value=i }

function submit() {
  if(revealed.value || chosen.value===null || !item.value) return
  const ok = checkAnswer(item.value, chosen.value)
  revealed.value = true
  emit('record', ok)
  if(ok) { playSfx('correct'); fireConfetti() } else playSfx('wrong')
}

function next() {
  if(atEnd.value) return
  pos.value++
  chosen.value = null
  revealed.value = false
}

function timeUp() {
  if(revealed.value || !item.value) return
  revealed.value = true
  emit('record', false)
  playSfx('wrong')
}

defineExpose({ timeUp })
</script>
<template>
  <DuoCard v-if="item">
    <div class="flex justify-between items-center">
      <span class="text-xs font-black uppercase tracking-wide text-duo-text-light">{{ item.category }}</span>
      <span v-if="item.level" class="text-xs font-black text-duo-blue">{{ item.level }}</span>
    </div>
    <h2 class="text-xl font-black text-duo-text mt-1">{{ item.question }}</h2>
    <div class="grid gap-2 mt-4">
      <button
        v-for="(o,i) in item.options"
        :key="i"
        :disabled="revealed"
        @click="choose(Number(i))"
        :class="[
          'text-left font-bold rounded-2xl border-2 p-4 transition-all disabled:cursor-default',
          chosen===Number(i) ? 'border-duo-blue bg-blue-50' : 'border-duo-gray bg-white hover:border-duo-gray-dark',
          revealed && Number(i)===item.answerIndex ? '!border-duo-green !bg-green-50' : '',
          revealed && chosen===Number(i) && Number(i)!==item.answerIndex ? '!border-duo-red !bg-red-50' : '',
        ]"
        :data-testid="`opt-${i}`"
      >{{ String.fromCharCode(65+Number(i)) }}. {{ o }}</button>
    </div>
    <p v-if="revealed && item.explain" class="mt-3 text-sm font-bold bg-duo-gray-light rounded-xl p-3">💡 {{ item.explain }}</p>
    <p v-if="revealed" class="mt-2 text-sm font-black" :class="chosen===item.answerIndex ? 'text-duo-green' : 'text-duo-red'" data-testid="practice-feedback">
      {{ chosen===item.answerIndex ? '✅ Correct!' : `❌ Answer: ${item.options[item.answerIndex]}` }}
    </p>
    <div class="mt-4 flex gap-3">
      <DuoButton v-if="!revealed" @click="submit" :disabled="chosen===null" data-testid="practice-submit">CHECK</DuoButton>
      <DuoButton v-else variant="secondary" :disabled="atEnd" @click="next" data-testid="practice-next">NEXT →</DuoButton>
    </div>
  </DuoCard>
  <p v-else class="font-bold text-duo-red">No questions in this pack yet — add some in Manage Packs.</p>
</template>