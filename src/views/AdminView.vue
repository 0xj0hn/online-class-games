<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { topicsSeed, quizSeed, pairsSeed, sentencesSeed, hangmanSeed, revealSeed, oddOneOutSeed, wordSortSeed, anagramSeed, emojiStorySeed, bingoSeed, pictionarySeed, twentyQSeed } from '@/data/seed'
import { PACK_REASONS } from '@/services/packs'
import { PACK_TYPES } from '@/data/packTypes'
import DuoButton from '@/components/ui/DuoButton.vue'
import DuoCard from '@/components/ui/DuoCard.vue'

const store = usePackStore()
const tab = ref<string>('topics')
const seedMap:any = { topics: topicsSeed, quiz: quizSeed, pairs: pairsSeed, sentences: sentencesSeed, hangman: hangmanSeed, reveal: revealSeed, 'odd-one-out': oddOneOutSeed, 'word-sort': wordSortSeed, anagram: anagramSeed, 'emoji-story': emojiStorySeed, bingo: bingoSeed, pictionary: pictionarySeed, 'twenty-questions': twentyQSeed }
const list = computed(()=> (store.overrides[tab.value] as any) ?? seedMap[tab.value])

const jsonDraft = ref('')
const newItemJson = ref('{"id":"new1","text":"Example"}')
const keyDraft = ref(store.adminKey)
const busy = ref(false)
const notice = ref('')

const sourceLabel = computed(()=> ({
  server:'Saved on the server — every device uses these',
  cache:'Offline copy only — server unreachable',
  seed:'Built-in starter packs — nothing saved yet',
}[store.source]))

async function refresh(){ busy.value=true; await store.load(); busy.value=false }

async function saveKey(){
  store.setAdminKey(keyDraft.value)
  notice.value = keyDraft.value.trim() ? 'Admin key saved on this device.' : 'Admin key cleared.'
}

function saveNew(){
  try{
    const obj=JSON.parse(newItemJson.value)
    if(!obj.id) obj.id=Date.now().toString()
    store.addItem(tab.value, obj, seedMap[tab.value])
    newItemJson.value='{}'
    notice.value = store.lastError ? PACK_REASONS[store.lastError] ?? store.lastError : 'Added and saved.'
  }catch{ notice.value = 'Invalid JSON' }
}
function remove(id:string){ store.deleteItem(tab.value, id, seedMap[tab.value]) }

async function doExport(){
  busy.value = true
  await store.load()
  jsonDraft.value = store.exportAll()
  busy.value = false
  notice.value = store.source === 'server' ? 'Exported from the server copy.' : 'Exported the offline copy (server unreachable).'
}

async function doImport(){
  busy.value = true
  try{
    const res = await store.importAll(jsonDraft.value)
    notice.value = res.ok ? `Imported and saved on the server (${res.items ?? 0} items).` : (PACK_REASONS[res.reason ?? ''] ?? 'Import failed.')
  }catch{
    notice.value = 'Invalid JSON'
  }finally{
    busy.value = false
  }
}

function resetCurrent(){ store.reset(tab.value) }
function resetAll(){ if(confirm('Reset all? This replaces the server copy too.')) store.reset() }

onMounted(()=> void refresh())
</script>
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-start gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-black text-duo-text">Admin · Packs</h1>
        <p class="font-bold text-sm text-duo-text-light">Edit word lists &amp; questions. Saved to the server database so every student device gets the same content.</p>
      </div>
      <div class="text-right">
        <span
          class="inline-block px-2 py-1 rounded-full text-xs font-black"
          :class="store.source==='server' ? 'bg-duo-green text-white' : store.source==='cache' ? 'bg-duo-yellow text-white' : 'bg-duo-gray text-white'"
          data-testid="pack-source"
        >{{ sourceLabel }}</span>
        <p v-if="store.updatedAt" class="text-xs font-bold text-duo-text-light mt-1">Updated {{ store.updatedAt }}</p>
        <DuoButton size="sm" variant="outline" class="mt-2" :disabled="busy" @click="refresh" data-testid="pack-reload">↻ Reload from server</DuoButton>
      </div>
    </div>

    <DuoCard>
      <h3 class="font-black">🔑 Admin key</h3>
      <p class="text-xs font-bold text-duo-text-light mt-1">Required to save packs. It must match <code>ADMIN_KEY</code> on your server. Students never need it.</p>
      <div class="flex gap-2 mt-3">
        <input
          v-model="keyDraft"
          type="password"
          placeholder="Admin key"
          autocomplete="off"
          class="flex-1 border-2 border-duo-gray rounded-xl px-3 py-2 font-bold outline-none focus:border-duo-blue"
          data-testid="admin-key-input"
        />
        <DuoButton size="sm" :variant="store.adminKey ? 'secondary' : 'primary'" @click="saveKey" data-testid="admin-key-save">
          {{ store.adminKey ? 'Change key' : 'Save key' }}
        </DuoButton>
      </div>
    </DuoCard>

    <div class="flex gap-2 flex-wrap">
      <button v-for="k in PACK_TYPES" :key="k" @click="tab=k" :class="['px-3 py-2 rounded-xl font-black text-sm border-2', tab===k ? 'bg-duo-green text-white border-duo-green-shadow' : 'bg-white border-duo-gray']">{{ k }}</button>
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
      <p class="text-xs font-bold text-duo-text-light mt-1">Export pulls the server copy. Import replaces the server copy and every device.</p>
      <div class="flex gap-2 mt-2">
        <DuoButton size="sm" variant="secondary" :disabled="busy" @click="doExport" data-testid="export-btn">Export JSON</DuoButton>
        <DuoButton size="sm" :disabled="busy" @click="doImport" data-testid="import-btn">Import JSON</DuoButton>
      </div>
      <textarea v-model="jsonDraft" placeholder="Paste JSON here for import, or click Export" class="w-full h-32 border-2 border-duo-gray rounded-xl p-2 font-mono text-xs mt-3" data-testid="json-area" />
      <p v-if="notice" class="mt-2 text-sm font-bold text-duo-text-light" data-testid="admin-notice">{{ notice }}</p>
    </DuoCard>
  </div>
</template>