<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>()
</script>
<template>
  <button
    :disabled="disabled"
    :class="[
      'font-nunito font-extrabold tracking-wide rounded-2xl border-2 transition-all active:translate-y-[3px] active:shadow-none select-none uppercase',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      size === 'sm' ? 'px-4 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-[15px]',
      variant === 'secondary' ? 'bg-duo-blue text-white border-duo-blue-shadow shadow-[0_4px_0_#0E82B8] active:shadow-[0_1px_0_#0E82B8]'
        : variant === 'outline' ? 'bg-white text-duo-blue border-duo-gray shadow-[0_4px_0_#E5E5E5] active:shadow-[0_1px_0_#E5E5E5]'
        : variant === 'danger' ? 'bg-duo-red text-white border-duo-red-shadow shadow-[0_4px_0_#D91C1C] active:shadow-[0_1px_0_#D91C1C]'
        : variant === 'yellow' ? 'bg-duo-yellow text-white border-duo-yellow-shadow shadow-[0_4px_0_#E5B000] active:shadow-[0_1px_0_#E5B000]'
        : 'bg-duo-green text-white border-duo-green-shadow shadow-[0_4px_0_#3DA100] active:shadow-[0_1px_0_#3DA100]'
    ]"
    data-testid="duo-button"
  >
    <slot />
  </button>
</template>
