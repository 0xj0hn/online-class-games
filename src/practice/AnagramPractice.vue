<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { anagramSeed } from '@/data/seed'
import { scramble, checkAnswer } from '@/games/anagram/logic'
import { shuffle } from '@/utils/random'
import { fireConfetti, playSfx } from '@/utils/effects'
import DuoCard from '@/components/ui/DuoCard.vue'
import DuoButton from '@/components/ui/DuoButton.vue'

const props = defineProps<{ round: number }>()
const emit = defineEmits<{ (e: 'record', ok: boolean): void }>()

const packStore = usePackStore()
const pool = computed<any[]>(()=> (packStore.overrides['anagram'] as any) ?? anagramSeed)
const order = ref<number[]>([])
const pos = ref(0)
const input = ref('')
const revealed = ref(false)
const jumble = ref('')

function build() {
  order.value = shuffle([...Array(pool.value.length).keys()])
  pos.value = 0
  input.value = ''
  revealed.value = false
  reJumble()
}

const item = computed<any>(()=> pool.value[order.value[pos.value]])
const atEnd = computed(()=> !order.value.length || pos.value>=order.value.length-1)
const ok = computed(()=> item.value ? checkAnswer(item.value.word, input.value) : false)

function reJumble() {
  jumble.value = item.value ? scramble(item.value.word) : ''
}

watch(()=> props.round, build, { immediate:true })
watch(pool, build)

function submit() {
  if(revealed.value || !item.value || !input.value.trim()) return
  const correct = ok.value
  revealed.value = true
  emit('record', correct)
  if(correct) { playSfx('correct'); fireConfetti() } else playSfx('wrong')
}

function next() {
  if(atEnd.value) return
  pos.value++
  input.value = ''
  revealed.value = false
  reJumble()
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
  <DuoCard v-if="item" class="text-center py-8">
    <p class="text-xs font-black uppercase tracking-wide text-duo-text-light">{{ item.hint }}</p>
    <p class="text-4xl font-black tracking-widest text-duo-blue mt-2" data-testid="practice-jumble">{{ jumble }}</p>
    <form class="mt-6" @submit.prevent="submit">
      <input
        v-model="input"
        placeholder="Type the word"
        autocomplete="off"
        autocapitalize="characters"
        :disabled="revealed"
        @keydown.enter.prevent="submit"
        class="w-full max-w-sm mx-auto border-2 border-duo-gray rounded-2xl px-4 py-3 font-bold text-center uppercase outline-none focus:border-duo-blue disabled:opacity-60"
        data-testid="practice-input"
      />
      <div class="mt-4">
        <DuoButton type="button" :disabled="revealed || !input.trim()" data-testid="practice-submit" @click="submit">CHECK</DuoButton>
      </div>
    </form>
    <p v-if="revealed" class="mt-4 text-sm font-black" :class="ok ? 'text-duo-green' : 'text-duo-red'" data-testid="practice-feedback">
      {{ ok ? '✅ Correct!' : `❌ It was ${item.word}` }}
    </p>
    <div v-if="revealed" class="mt-4">
      <DuoButton variant="secondary" :disabled="atEnd" @click="next" data-testid="practice-next">NEXT →</DuoButton>
    </div>
  </DuoCard>
  <p v-else class="font-bold text-duo-red">No words in this pack yet — add some in Manage Packs.</p>
</template>