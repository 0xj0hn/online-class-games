<script setup lang="ts">
import type { Team } from '@/types'
defineProps<{ teams: Team[]; activeId?: string; streaks?: Record<string, number> }>()
</script>
<template>
  <div class="flex gap-3 flex-wrap" data-testid="scoreboard">
    <div
      v-for="t in teams"
      :key="t.id"
      :data-testid="`team-${t.id}`"
      :class="['flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-extrabold text-sm transition-all', activeId===t.id ? 'border-duo-blue bg-blue-50 scale-105' : 'border-duo-gray bg-white']"
    >
      <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" :style="{background: t.color}">{{ t.avatar }}</span>
      <span class="text-duo-text">{{ t.name }}</span>
      <span class="bg-duo-yellow text-white px-2 py-0.5 rounded-full text-xs">{{ t.score }} XP</span>
      <span v-if="streaks && streaks[t.id]>=2" class="bg-duo-red text-white px-2 py-0.5 rounded-full text-xs">🔥×{{ streaks[t.id] }}</span>
    </div>
  </div>
</template>
