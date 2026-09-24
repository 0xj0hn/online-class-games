import { ref } from 'vue'

export function usePowerUps() {
  const doubleUsed = ref(false)
  const freezeUsed = ref(false)
  const fiftyUsed = ref(false)
  const doubleActive = ref(false)

  function useDouble() { if (doubleUsed.value) return false; doubleUsed.value = true; doubleActive.value = true; return true }
  function consumeDouble(): boolean { if (doubleActive.value) { doubleActive.value = false; return true } return false }
  function useFreeze(): boolean { if (freezeUsed.value) return false; freezeUsed.value = true; return true }
  function useFifty(): boolean { if (fiftyUsed.value) return false; fiftyUsed.value = true; return true }
  function reset() { doubleUsed.value = false; freezeUsed.value = false; fiftyUsed.value = false; doubleActive.value = false }

  return { doubleUsed, freezeUsed, fiftyUsed, doubleActive, useDouble, consumeDouble, useFreeze, useFifty, reset }
}
