<script setup lang="ts">
import { ref } from 'vue'
import DuoButton from '@/components/ui/DuoButton.vue'
import type { Team } from '@/types'
const props = defineProps<{ modelValue: Team[] }>()
const emit = defineEmits<{ (e:'update:modelValue', v:Team[]):void }>()
const colors = ['#58CC02','#1CB0F6','#FFC800','#FF4B4B','#CE82FF','#FF9600']
const avatars = ['🦊','🐻','🐸','🐼','🦁','🐶']
function addTeam(){
  if(props.modelValue.length>=6) return
  const id = Date.now().toString()
  emit('update:modelValue', [...props.modelValue, { id, name: `Team ${props.modelValue.length+1}`, color: colors[props.modelValue.length%colors.length], score:0, avatar: avatars[props.modelValue.length%avatars.length]}])
}
function removeTeam(id:string){ emit('update:modelValue', props.modelValue.filter(t=>t.id!==id)) }
function updateName(id:string, name:string){ emit('update:modelValue', props.modelValue.map(t=>t.id===id?{...t,name}:t)) }
</script>
<template>
  <div class="space-y-3" data-testid="team-selector">
    <div v-for="t in modelValue" :key="t.id" class="flex gap-2 items-center bg-white rounded-2xl border-2 border-duo-gray p-3">
      <span class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" :style="{background:t.color}">{{ t.avatar }}</span>
      <input :value="t.name" @input="updateName(t.id, ($event.target as HTMLInputElement).value)" class="flex-1 font-bold text-duo-text bg-duo-gray-light rounded-xl px-3 py-2 outline-none border-2 border-transparent focus:border-duo-blue" :data-testid="`team-input-${t.id}`" />
      <button @click="removeTeam(t.id)" class="text-duo-gray-dark hover:text-duo-red font-black px-2" aria-label="remove">✕</button>
    </div>
    <DuoButton v-if="modelValue.length<6" variant="outline" @click="addTeam" data-testid="add-team">+ Add Team</DuoButton>
    <p v-else class="text-xs text-duo-text-light font-bold">Max 6 teams</p>
  </div>
</template>
