import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_KEY = 'bbb_packs_v1'

export const usePackStore = defineStore('packs', ()=>{
  const overrides = ref<Record<string, any[]>>(JSON.parse(localStorage.getItem(LS_KEY) || '{}'))

  function persist(){ localStorage.setItem(LS_KEY, JSON.stringify(overrides.value)) }

  function getPack(type: string, seed: any[]){
    return computed(()=> overrides.value[type] ?? seed)
  }

  function setPack(type: string, data: any[]){
    overrides.value[type]=data; persist()
  }
  function addItem(type:string, item:any, seed:any[]){
    const cur = overrides.value[type] ?? [...seed]
    overrides.value[type]=[...cur, item]; persist()
  }
  function updateItem(type:string, id:string, patch:any, seed:any[]){
    const cur = overrides.value[type] ?? [...seed]
    overrides.value[type]=cur.map((i:any)=> i.id===id ? {...i, ...patch}:i); persist()
  }
  function deleteItem(type:string, id:string, seed:any[]){
    const cur = overrides.value[type] ?? [...seed]
    overrides.value[type]=cur.filter((i:any)=> i.id!==id); persist()
  }
  function reset(type?:string){
    if(type) delete overrides.value[type]
    else overrides.value={}
    persist()
  }
  function exportAll(){ return JSON.stringify(overrides.value, null, 2) }
  function importAll(json:string){
    overrides.value = JSON.parse(json); persist()
  }

  return { overrides, getPack, setPack, addItem, updateItem, deleteItem, reset, exportAll, importAll }
})
