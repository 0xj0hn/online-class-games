<script setup lang="ts">
import ProgressBar from '@/components/shared/ProgressBar.vue'
import TimerToggle from '@/components/shared/TimerToggle.vue'
import DuoButton from '@/components/ui/DuoButton.vue'
import type { PracticeConfig } from '@/practice/config'

defineProps<{
  config: PracticeConfig
  answered: number
  total: number
  correct: number
  streak: number
  xp: number
  remaining: number
  running: boolean
  finished: boolean
}>()
defineEmits<{ (e: 'toggle-timer'): void; (e: 'restart'): void }>()
</script>
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-2xl border-2 border-duo-gray p-4 flex flex-wrap items-center gap-3">
      <span class="text-2xl">{{ config.icon }}</span>
      <div class="flex-1 min-w-32">
        <h2 class="font-black text-duo-text leading-tight">{{ config.title }} Practice</h2>
        <p class="text-xs font-bold text-duo-text-light">Question {{ Math.min(answered+1, total) }} of {{ total }}</p>
      </div>
      <span class="px-2 py-1 rounded-full text-xs font-black bg-duo-green text-white" data-testid="practice-correct">{{ correct }} ✓</span>
      <span class="px-2 py-1 rounded-full text-xs font-black bg-duo-yellow text-white" data-testid="practice-streak">🔥 {{ streak }}</span>
      <span class="px-2 py-1 rounded-full text-xs font-black bg-duo-blue text-white" data-testid="practice-xp">{{ xp }} XP</span>
    </div>

    <div class="flex justify-between items-center gap-3">
      <span class="font-black text-sm text-duo-text-light">Solo drill — play as many rounds as you like</span>
      <span class="flex items-center gap-2">
        <span class="font-black text-duo-red text-sm" data-testid="practice-timer">{{ remaining }}s</span>
        <TimerToggle :running="running" @toggle="$emit('toggle-timer')" />
      </span>
    </div>
    <ProgressBar :value="remaining" :max="config.seconds" color="#FF4B4B" />

    <slot />

    <div v-if="finished" class="bg-green-50 border-2 border-duo-green rounded-2xl p-4 flex flex-wrap items-center gap-3" data-testid="practice-summary">
      <span class="font-black text-duo-green">Round complete!</span>
      <span class="font-bold text-sm text-duo-text">{{ correct }}/{{ total }} correct · +{{ xp }} XP</span>
      <slot name="summary" />
      <DuoButton size="sm" @click="$emit('restart')" data-testid="practice-restart">🔁 Next round</DuoButton>
    </div>
  </div>
</template>