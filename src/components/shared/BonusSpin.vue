<script setup lang="ts">
import { ref } from 'vue'
import DuoButton from '@/components/ui/DuoButton.vue'
import DuoCard from '@/components/ui/DuoCard.vue'
const emit = defineEmits<{ (e: 'award', xp: number): void; (e: 'close'): void }>()
const spinning = ref(false)
const reward = ref<number | null>(null)
const angle = ref(0)
function spin() {
  if (spinning.value) return
  spinning.value = true
  angle.value += 720 + Math.floor(Math.random() * 720)
  setTimeout(() => {
    const opts = [5, 10, 15, 20]
    reward.value = opts[Math.floor(Math.random() * opts.length)]
    spinning.value = false
  }, 900)
}
function claim() { if (reward.value) emit('award', reward.value); emit('close') }
</script>
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="emit('close')">
    <DuoCard class="max-w-sm w-full text-center">
      <h2 class="text-2xl font-black text-duo-text">🎡 BONUS SPIN!</h2>
      <p class="font-bold text-duo-text-light">3 streak! Spin for bonus XP</p>
      <div class="mx-auto mt-4 w-40 h-40 rounded-full border-[6px] border-duo-yellow bg-duo-yellow/20 flex items-center justify-center text-5xl transition-transform duration-700" :style="{ transform: `rotate(${angle}deg)` }">🎡</div>
      <p v-if="reward !== null" class="mt-3 font-black text-duo-green text-xl">+{{ reward }} XP!</p>
      <div class="flex justify-center gap-2 mt-4">
        <DuoButton v-if="reward === null" variant="yellow" @click="spin" :disabled="spinning">{{ spinning ? 'Spinning...' : 'SPIN!' }}</DuoButton>
        <DuoButton v-else @click="claim">Claim +{{ reward }} XP</DuoButton>
        <DuoButton variant="outline" @click="emit('close')">Close</DuoButton>
      </div>
    </DuoCard>
  </div>
</template>
