<script setup lang="ts">
import DuoButton from '@/components/ui/DuoButton.vue'
defineProps<{ running: boolean; disabled?: boolean }>()
defineEmits<{ (e: 'toggle'): void }>()
</script>
<template>
  <DuoButton
    size="sm"
    :variant="running ? 'outline' : 'secondary'"
    :disabled="disabled"
    data-testid="timer-toggle"
    @click="$emit('toggle')"
  >{{ running ? '⏸ Pause' : '▶ Start' }}</DuoButton>
</template>