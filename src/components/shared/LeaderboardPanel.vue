<script setup lang="ts">
import type { LeaderEntry } from '@/services/leaderboard'

defineProps<{ entries: LeaderEntry[]; me?: string; loading?: boolean; enabled?: boolean }>()
const medals = ['🥇', '🥈', '🥉']
</script>
<template>
  <div class="bg-white rounded-2xl border-2 border-duo-gray p-4">
    <div class="flex justify-between items-center">
      <h3 class="font-black text-duo-text">🏆 Class Leaderboard</h3>
      <span v-if="!enabled" class="text-xs font-bold text-duo-text-light">offline</span>
    </div>
    <p v-if="!enabled" class="mt-2 text-xs font-bold text-duo-text-light">
      Set VITE_API_URL to publish scores. Your practice still works — results are just not shared.
    </p>
    <p v-else-if="loading" class="mt-2 text-xs font-bold text-duo-text-light">Loading scores…</p>
    <p v-else-if="!entries.length" class="mt-2 text-xs font-bold text-duo-text-light">
      No scores yet — be the first to put a name on the board.
    </p>
    <ol v-else class="mt-2 space-y-1" data-testid="leaderboard-list">
      <li
        v-for="(e, i) in entries"
        :key="e.name"
        class="flex items-center gap-2 rounded-xl px-2 py-1 font-bold text-sm"
        :class="e.name === me ? 'bg-duo-yellow/20 border-2 border-duo-yellow' : ''"
      >
        <span class="w-6 text-center font-black">{{ medals[i] ?? i+1 }}</span>
        <span class="flex-1 truncate text-duo-text">{{ e.name }}</span>
        <span class="text-duo-text-light text-xs">{{ e.correct }}/{{ e.total }}</span>
        <span class="font-black text-duo-green">{{ e.xp }} XP</span>
      </li>
    </ol>
  </div>
</template>