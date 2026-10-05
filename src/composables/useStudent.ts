import { ref } from 'vue'
import { cleanName } from '@/practice/config'

const KEY = 'bbb.practice.student'

export function useStudent() {
  const name = ref('')
  try { name.value = cleanName(localStorage.getItem(KEY)) ?? '' } catch { name.value = '' }

  function save(raw: string): boolean {
    const clean = cleanName(raw)
    if(!clean) return false
    name.value = clean
    try { localStorage.setItem(KEY, clean) } catch {}
    return true
  }

  function clear() {
    name.value = ''
    try { localStorage.removeItem(KEY) } catch {}
  }

  return { name, save, clear }
}