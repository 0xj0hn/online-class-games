<script setup lang="ts">
import { ref } from 'vue'
import DuoCard from '@/components/ui/DuoCard.vue'
import DuoButton from '@/components/ui/DuoButton.vue'
import { PRACTICE_MAX_NAME } from '@/practice/config'

const props = defineProps<{ saving?: boolean; error?: string }>()
const emit = defineEmits<{ (e: 'save', name: string): void }>()
const name = ref('')

function submit() {
  if(!name.value.trim() || props.saving) return
  emit('save', name.value)
}
</script>
<template>
  <DuoCard class="text-center max-w-md mx-auto">
    <p class="text-4xl">👋</p>
    <h2 class="text-xl font-black text-duo-text mt-2">Who's practising?</h2>
    <p class="text-sm font-bold text-duo-text-light mt-1">Your name goes on the class leaderboard. We only remember it on this device.</p>
    <form class="mt-4 flex gap-2" @submit.prevent="submit">
      <input
        v-model="name"
        :maxlength="PRACTICE_MAX_NAME"
        placeholder="Your name"
        autocomplete="off"
        @keydown.enter.prevent="submit"
        class="flex-1 border-2 border-duo-gray rounded-2xl px-4 py-3 font-bold outline-none focus:border-duo-blue"
        data-testid="practice-name-input"
      />
      <DuoButton type="button" :disabled="!name.trim() || saving" data-testid="practice-name-save" @click="submit">Start →</DuoButton>
    </form>
    <p v-if="error" class="mt-2 text-sm font-bold text-duo-red" data-testid="practice-name-error">{{ error }}</p>
  </DuoCard>
</template>