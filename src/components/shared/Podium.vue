<script setup lang="ts">
import type { Team } from '@/types'
import DuoCard from '@/components/ui/DuoCard.vue'
import DuoButton from '@/components/ui/DuoButton.vue'
defineProps<{ teams: Team[] }>()
defineEmits<{ (e: 'close'): void }>()
</script>
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <DuoCard class="max-w-md w-full text-center">
      <h2 class="text-2xl font-black text-duo-text">🏆 Lesson Podium</h2>
      <div class="flex justify-center items-end gap-2 mt-6">
        <div v-for="(t, i) in [...teams].sort((a, b) => b.score - a.score).slice(0, 3)" :key="t.id" :class="['rounded-2xl border-2 p-3 w-28 flex flex-col items-center', i === 0 ? 'bg-duo-yellow border-duo-yellow-shadow order-2 h-36' : i === 1 ? 'bg-duo-gray-light border-duo-gray order-1 h-28' : 'bg-orange-100 border-orange-300 order-3 h-24']">
          <span class="text-xl">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}</span>
          <span class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black mt-1" :style="{ background: t.color }">{{ t.avatar }}</span>
          <span class="font-black text-sm mt-1">{{ t.name }}</span>
          <span class="font-black text-xs bg-white rounded-full px-2">{{ t.score }} XP</span>
        </div>
      </div>
      <ol class="mt-4 text-left space-y-1">
        <li v-for="(t, i) in [...teams].sort((a, b) => b.score - a.score)" :key="t.id" class="flex justify-between font-bold text-sm border-b border-duo-gray-light py-1"><span>{{ i + 1 }}. {{ t.avatar }} {{ t.name }}</span><span>{{ t.score }} XP</span></li>
      </ol>
      <DuoButton class="mt-4" variant="secondary" @click="$emit('close')">Continue</DuoButton>
    </DuoCard>
  </div>
</template>
