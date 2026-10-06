import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchPacks, savePacks, type PackMap } from '@/services/packs'

export const PACKS_CACHE_KEY = 'bbb.packs.cache.v2'

const ADMIN_KEY_STORAGE = 'bbb.admin.key'

const readCache = (): Record<string, any[]> => {
  try { return JSON.parse(localStorage.getItem(PACKS_CACHE_KEY) || '{}') } catch { return {} }
}

const readAdminKey = (): string => {
  try { return localStorage.getItem(ADMIN_KEY_STORAGE) || '' } catch { return '' }
}

export const usePackStore = defineStore('packs', ()=>{
  const overrides = ref<Record<string, any[]>>(readCache())
  const ready = ref(false)
  const source = ref<'server'|'cache'|'seed'>('seed')
  const updatedAt = ref<string | null>(null)
  const adminKey = ref(readAdminKey())
  const lastError = ref('')

  function persist(){ localStorage.setItem(PACKS_CACHE_KEY, JSON.stringify(overrides.value)) }

  function setAdminKey(value: string){
    adminKey.value = value.trim()
    try { localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.value) } catch {}
  }

  async function load(){
    const res = await fetchPacks()
    if(res.ok && res.packs && Object.keys(res.packs).length){
      overrides.value = res.packs as Record<string, any[]>
      source.value = 'server'
      updatedAt.value = res.updatedAt ?? null
      persist()
    } else {
      source.value = Object.keys(overrides.value).length ? 'cache' : 'seed'
    }
    ready.value = true
    return source.value
  }

  async function push(){
    const res = await savePacks(overrides.value as PackMap, adminKey.value)
    if(res.ok){
      source.value = 'server'
      updatedAt.value = res.updatedAt ?? null
      lastError.value = ''
    } else if(res.reason !== 'offline') {
      lastError.value = res.reason ?? 'request-failed'
    }
    return res
  }

  function setPack(type: string, data: any[]){
    overrides.value[type]=data; persist(); void push()
  }
  function addItem(type:string, item:any, seed:any[]){
    const cur = overrides.value[type] ?? [...seed]
    overrides.value[type]=[...cur, item]; persist(); void push()
  }
  function updateItem(type:string, id:string, patch:any, seed:any[]){
    const cur = overrides.value[type] ?? [...seed]
    overrides.value[type]=cur.map((i:any)=> i.id===id ? {...i, ...patch}:i); persist(); void push()
  }
  function deleteItem(type:string, id:string, seed:any[]){
    const cur = overrides.value[type] ?? [...seed]
    overrides.value[type]=cur.filter((i:any)=> i.id!==id); persist(); void push()
  }
  function reset(type?:string){
    if(type) delete overrides.value[type]
    else overrides.value={}
    persist(); void push()
  }
  function exportAll(){ return JSON.stringify(overrides.value, null, 2) }
  function importAll(json:string){
    overrides.value=JSON.parse(json)
    persist()
    return push()
  }

  return {
    overrides, ready, source, updatedAt, adminKey, lastError,
    load, push, setAdminKey, setPack, addItem, updateItem, deleteItem, reset, exportAll, importAll,
  }
})