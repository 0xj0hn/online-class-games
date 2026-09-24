<script setup lang="ts">
import DuoCard from '@/components/ui/DuoCard.vue'
import DuoButton from '@/components/ui/DuoButton.vue'
import TeamSelector from '@/components/shared/TeamSelector.vue'
import { useTeamStore } from '@/stores/teamStore'
import { ref } from 'vue'
const teamStore = useTeamStore()

const games = [
  { id:'spin-wheel', title:'Spin & Speak', desc:'Spin the wheel → speak 30s', icon:'🎡', color:'#FF9600', xp:'10 XP' },
  { id:'quiz-race', title:'Quiz Race', desc:'Timer 15s + speed bonus', icon:'⚡', color:'#1CB0F6', xp:'15 XP' },
  { id:'memory-match', title:'Memory Match', desc:'Word ↔ Definition', icon:'🧠', color:'#CE82FF', xp:'20 XP' },
  { id:'sentence-builder', title:'Sentence Builder', desc:'Drag words in order', icon:'🧩', color:'#58CC02', xp:'15 XP' },
  { id:'hangman', title:'Hangman', desc:'Guess the word', icon:'🪢', color:'#FF4B4B', xp:'15 XP' },
  { id:'word-reveal', title:'Word Reveal', desc:'Guess the blurred image', icon:'👁️', color:'#FFC800', xp:'20 XP' },
  { id:'odd-one-out', title:'Odd One Out', desc:'Which is different? 20s', icon:'🧐', color:'#FF4B4B', xp:'10 XP' },
  { id:'word-sort', title:'Word Sort', desc:'Drag to 3 buckets 60s', icon:'🗂️', color:'#0EA5E9', xp:'15 XP' },
  { id:'anagram', title:'Anagram', desc:'Unscramble 30s', icon:'🔀', color:'#58CC02', xp:'10 XP' },
  { id:'emoji-story', title:'Emoji Story', desc:'Emojis → sentence 45s', icon:'😊', color:'#FF9600', xp:'15 XP' },
  { id:'bingo', title:'Bingo', desc:'Draw · 3×3 · Auto 3s', icon:'🎱', color:'#CE82FF', xp:'20 XP' },
  { id:'pictionary', title:'Pictionary', desc:'Draw & guess 60s', icon:'🎨', color:'#FFC800', xp:'15 XP' },
  { id:'twenty-questions', title:'20 Questions', desc:'Guess secret 20 left', icon:'❓', color:'#A855F7', xp:'20 XP' },
]
</script>
<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl border-2 border-duo-gray p-6 flex flex-col md:flex-row gap-6 items-start">
      <div class="flex-1">
        <h1 class="text-3xl font-black text-duo-text leading-tight">Duo-Style Games for BBB</h1>
        <p class="text-duo-text-light font-bold mt-2">Teacher shares screen · Students answer via mic/chat · You award XP</p>
        <div class="flex gap-2 mt-4">
          <router-link to="/admin"><DuoButton variant="outline" size="sm">⚙️ Manage Packs</DuoButton></router-link>
          <span class="text-xs font-bold text-duo-text-light self-center">A1-B1 · Ages 11-14 · 3-6 teams</span>
        </div>
      </div>
      <div class="w-full md:w-80">
        <h3 class="font-black text-sm text-duo-text-light uppercase tracking-wide mb-2">Teams (teacher edits)</h3>
        <TeamSelector v-model="teamStore.teams" />
      </div>
    </div>

    <!-- Duo path -->
    <div class="grid md:grid-cols-3 gap-4">
      <router-link v-for="g in games" :key="g.id" :to="`/game/${g.id}`">
        <DuoCard clickable class="h-full hover:-translate-y-1 transition-transform">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3" :style="{background: g.color + '20', border: `2px solid ${g.color}`}">{{ g.icon }}</div>
          <h3 class="font-black text-duo-text">{{ g.title }}</h3>
          <p class="text-sm font-bold text-duo-text-light">{{ g.desc }}</p>
          <span class="inline-block mt-3 text-xs font-black bg-duo-yellow text-white px-2 py-1 rounded-full">{{ g.xp }}</span>
        </DuoCard>
      </router-link>
    </div>

    <div class="bg-duo-blue text-white rounded-2xl p-4 font-bold text-sm flex gap-3 items-center">
      <span class="text-xl">💡</span> Tip: In BigBlueButton, click Share Screen → Share your browser tab. Students shout answers, you click Reveal / Correct.
    </div>
  </div>
</template>
