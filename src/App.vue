<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b-2 border-duo-gray sticky top-0 z-20">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 font-black text-duo-green text-xl tracking-tight">
          <span class="w-8 h-8 bg-duo-green text-white rounded-lg flex items-center justify-center">🦉</span>
          BBB Games
        </router-link>
        <nav class="flex gap-2">
          <router-link to="/" class="font-bold text-sm px-3 py-2 rounded-xl hover:bg-duo-gray-light">Lobby</router-link>
          <router-link to="/admin" class="font-bold text-sm px-3 py-2 rounded-xl bg-duo-gray-light">Admin</router-link>
        </nav>
      </div>
    </header>
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
      <router-view />
    </main>
    <footer class="text-center text-xs font-bold text-duo-text-light py-4">Teacher-Projected · 3-6 teams · Share screen in BigBlueButton</footer>
  </div>
</template>
