<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { topicsSeed, quizSeed, pairsSeed, sentencesSeed, hangmanSeed, revealSeed, oddOneOutSeed, wordSortSeed, anagramSeed, emojiStorySeed, bingoSeed, pictionarySeed, twentyQSeed } from '@/data/seed'
import DuoButton from '@/components/ui/DuoButton.vue'
import DuoCard from '@/components/ui/DuoCard.vue'

const store = usePackStore()
const tab = ref<'topics'|'quiz'|'pairs'|'sentences'|'hangman'|'reveal'|'odd-one-out'|'word-sort'|'anagram'|'emoji-story'|'bingo'|'pictionary'|'twenty-questions'>('topics')
const seedMap:any = { topics: topicsSeed, quiz: quizSeed, pairs: pairsSeed, sentences: sentencesSeed, hangman: hangmanSeed, reveal: revealSeed, 'odd-one-out': oddOneOutSeed, 'word-sort': wordSortSeed, 'anagram': anagramSeed, 'emoji-story': emojiStorySeed, 'bingo': bingoSeed, 'pictionary': pictionarySeed, 'twenty-questions': twentyQSeed }
const list = computed(()=> (store.overrides[tab.value] as any) ?? seedMap[tab.value])

const jsonDraft = ref('')
const newItemJson = ref('{"id":"new1","text":"Example"}')

function saveNew(){
  try{
    const obj=JSON.parse(newItemJson.value)
    if(!obj.id) obj.id=Date.now().toString()
    store.addItem(tab.value, obj, seedMap[tab.value])
    newItemJson.value='{}'
  }catch(e){ alert('Invalid JSON') }
}
function remove(id:string){ store.deleteItem(tab.value, id, seedMap[tab.value]) }
function doExport(){ jsonDraft.value=store.exportAll() }
function doImport(){
  try{ store.importAll(jsonDraft.value); alert('Imported') } catch{ alert('Invalid JSON')}
}
function resetCurrent(){ store.reset(tab.value) }
function resetAll(){ if(confirm('Reset all?')) store.reset() }
</script>
<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-black text-duo-text">Admin · Packs</h1>
    <p class="font-bold text-sm text-duo-text-light">Edit word lists & questions. Saved in browser localStorage. Export JSON to backup.</p>
    <div class="flex gap-2 flex-wrap">
      <button v-for="k in Object.keys(seedMap)" :key="k" @click="tab=k as any" :class="['px-3 py-2 rounded-xl font-black text-sm border-2', tab===k ? 'bg-duo-green text-white border-duo-green-shadow' : 'bg-white border-duo-gray']">{{ k }}</button>
    </div>
    <DuoCard>
      <div class="flex justify-between items-center">
        <h3 class="font-black">{{ tab }} ({{ list.length }} items)</h3>
        <div class="flex gap-2">
          <DuoButton size="sm" variant="outline" @click="resetCurrent">Reset {{ tab }}</DuoButton>
          <DuoButton size="sm" variant="danger" @click="resetAll">Reset All</DuoButton>
        </div>
      </div>
      <div class="mt-4 space-y-2 max-h-96 overflow-auto border-2 border-duo-gray rounded-xl p-2 bg-duo-gray-light">
        <div v-for="it in list" :key="it.id" class="flex justify-between gap-2 bg-white rounded-xl border border-duo-gray p-2 text-xs font-bold">
          <pre class="overflow-auto flex-1">{{ JSON.stringify(it) }}</pre>
          <button @click="remove(it.id)" class="text-duo-red font-black">✕</button>
        </div>
      </div>
      <div class="mt-4">
        <p class="font-black text-sm">Add item (JSON):</p>
        <textarea v-model="newItemJson" class="w-full h-20 border-2 border-duo-gray rounded-xl p-2 font-mono text-xs mt-2" />
        <DuoButton class="mt-2" size="sm" @click="saveNew">Add Item</DuoButton>
      </div>
    </DuoCard>
    <DuoCard>
      <h3 class="font-black">Export / Import All</h3>
      <div class="flex gap-2 mt-2">
        <DuoButton size="sm" variant="secondary" @click="doExport">Export JSON</DuoButton>
        <DuoButton size="sm" @click="doImport">Import JSON</DuoButton>
      </div>
      <textarea v-model="jsonDraft" placeholder="Paste JSON here for import, or click Export" class="w-full h-32 border-2 border-duo-gray rounded-xl p-2 font-mono text-xs mt-3" data-testid="json-area" />
    </DuoCard>
  </div>
</template>
