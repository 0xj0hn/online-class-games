<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ xp: number; show: boolean }>()
const visible = ref(false)
watch(() => props.show, v => { if (v) { visible.value = true; setTimeout(() => (visible.value = false), 1200) } })
</script>
<template>
  <div v-if="visible" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
    <div class="bg-duo-green text-white font-black text-2xl px-6 py-3 rounded-2xl border-2 border-duo-green-shadow shadow-lg animate-bounce">+{{ xp }} XP</div>
  </div>
</template>
