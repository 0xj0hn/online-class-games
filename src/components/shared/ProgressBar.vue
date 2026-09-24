<script setup lang="ts">
defineProps<{ value: number; max?: number; color?: string }>()
</script>
<template>
  <div class="h-4 bg-duo-gray rounded-full overflow-hidden w-full">
    <div
      class="h-full rounded-full transition-all duration-500"
      :style="{ width: `${Math.min(100, (value / (max ?? 100)) * 100)}%`, background: color ?? '#58CC02' }"
      data-testid="progress-fill"
    />
  </div>
</template>
