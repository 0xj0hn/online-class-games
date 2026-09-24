<script setup lang="ts">
defineProps<{ clickable?: boolean }>()
</script>
<template>
  <div
    :class="['bg-white rounded-2xl border-2 border-duo-gray shadow-[0_2px_0_rgba(0,0,0,0.08)] p-5', clickable ? 'hover:shadow-md cursor-pointer hover:border-duo-gray-dark transition-all' : '']"
    data-testid="duo-card"
  >
    <slot />
  </div>
</template>
