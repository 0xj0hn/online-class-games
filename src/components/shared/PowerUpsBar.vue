<script setup lang="ts">
defineProps<{ doubleUsed: boolean; freezeUsed: boolean; fiftyUsed: boolean; canFifty: boolean }>()
defineEmits<{ (e: 'double'): void; (e: 'freeze'): void; (e: 'fifty'): void }>()
</script>
<template>
  <div class="flex gap-2 flex-wrap">
    <button @click="$emit('double')" :disabled="doubleUsed" :class="['px-3 py-2 rounded-xl font-black text-xs border-2 border-b-4', doubleUsed ? 'bg-duo-gray text-duo-text-light border-duo-gray-dark opacity-50' : 'bg-duo-yellow text-white border-duo-yellow-shadow']" data-testid="power-double">⚡ Double XP {{ doubleUsed ? '✓' : '' }}</button>
    <button @click="$emit('freeze')" :disabled="freezeUsed" :class="['px-3 py-2 rounded-xl font-black text-xs border-2 border-b-4', freezeUsed ? 'bg-duo-gray text-duo-text-light opacity-50' : 'bg-duo-blue text-white border-duo-blue-shadow']" data-testid="power-freeze">❄️ Freeze 5s {{ freezeUsed ? '✓' : '' }}</button>
    <button v-if="canFifty" @click="$emit('fifty')" :disabled="fiftyUsed" :class="['px-3 py-2 rounded-xl font-black text-xs border-2 border-b-4', fiftyUsed ? 'bg-duo-gray opacity-50' : 'bg-white border-duo-gray']" data-testid="power-fifty">🔀 50/50 {{ fiftyUsed ? '✓' : '' }}</button>
  </div>
</template>
