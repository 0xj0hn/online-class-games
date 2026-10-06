<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePackStore } from '@/stores/packStore'
import { useTimer } from '@/composables/useTimer'
import { useStudent } from '@/composables/useStudent'
import { usePracticeRound } from '@/composables/usePracticeRound'
import { fetchLeaderboard, submitScore, leaderboardEnabled, SUBMIT_ERRORS, type LeaderEntry } from '@/services/leaderboard'
import { PRACTICE_CONFIGS, isPracticeGame, type PracticeGameId } from '@/practice/config'
import { PRACTICE_REGISTRY, practiceRoundLength } from '@/practice/registry'
import PracticeShell from '@/practice/PracticeShell.vue'
import NameGate from '@/components/shared/NameGate.vue'
import LeaderboardPanel from '@/components/shared/LeaderboardPanel.vue'
import DuoButton from '@/components/ui/DuoButton.vue'

const route = useRoute()
const packStore = usePackStore()
const student = useStudent()
const gameRef = ref<{ timeUp?: () => void } | null>(null)
const nameError = ref('')
const entries = ref<LeaderEntry[]>([])
const loadingBoard = ref(false)
const submitting = ref(false)
const notice = ref('')
const submittedXp = ref<number|null>(null)
const roundKey = ref(0)
const userPaused = ref(false)

const id = computed(()=> String(route.params.id ?? ''))
const gameId = computed<PracticeGameId | null>(()=> isPracticeGame(id.value) ? id.value : null)
const valid = computed(()=> gameId.value !== null)
const cfg = computed(()=> gameId.value ? PRACTICE_CONFIGS[gameId.value] : null)
const entry = computed(()=> gameId.value ? PRACTICE_REGISTRY[gameId.value] : null)
const total = computed(()=> practiceRoundLength(packStore.overrides, gameId.value))

const timer = useTimer(cfg.value?.seconds ?? 15)
const round = usePracticeRound(gameId, total)

async function loadBoard() {
  if(!gameId.value || !leaderboardEnabled()) return
  loadingBoard.value = true
  entries.value = await fetchLeaderboard(gameId.value!, 10)
  loadingBoard.value = false
}

function startRound() {
  round.reset()
  roundKey.value++
  userPaused.value = false
  submittedXp.value = null
  notice.value = ''
  timer.start(cfg.value?.seconds)
}

function onRecord(ok: boolean) { round.record(ok) }

function toggleTimer() {
  userPaused.value = timer.running.value
  timer.toggle()
}

function saveName(raw: string) {
  nameError.value = student.save(raw) ? '' : 'Please use at least 2 characters.'
}

async function send() {
  if(!gameId.value || submitting.value || !round.submittable.value) return
  const clean = student.name.value
  if(!clean) { nameError.value = SUBMIT_ERRORS['bad-name']; return }
  submitting.value = true
  notice.value = ''
  const res = await submitScore({ game:gameId.value!, name:clean, correct:round.correct.value, total:total.value })
  submitting.value = false
  if(!res.ok) { notice.value = SUBMIT_ERRORS[res.reason ?? ''] ?? SUBMIT_ERRORS['request-failed']; return }
  submittedXp.value = res.personalBest ?? res.entry?.xp ?? null
  notice.value = `Saved! ${clean} is on the board with ${submittedXp.value} XP.`
  await loadBoard()
}

watch(()=> round.answered.value, (n, prev)=>{
  if(n>prev && !round.finished.value && !userPaused.value) timer.start(cfg.value?.seconds)
})
watch(()=> round.finished.value, done=>{ if(done) timer.stop() })
watch(()=> timer.remaining.value, (n, prev)=>{
  if(n<=0 && prev>0 && !round.finished.value) gameRef.value?.timeUp?.()
})
function whenPacksReady(cb: () => void) {
  if(packStore.ready) return void cb()
  const stop = watch(()=> packStore.ready, ok=>{
    if(!ok) return
    stop()
    cb()
  })
}

watch(()=> id.value, ()=>{ if(valid.value) whenPacksReady(startRound) })
watch(()=> packStore.overrides, ()=>{ if(valid.value && packStore.ready) startRound() })

onMounted(()=>{
  if(valid.value) whenPacksReady(startRound)
  loadBoard()
})
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <router-link to="/" class="font-bold text-sm text-duo-blue">← Lobby</router-link>
      <DuoButton v-if="student.name.value" size="sm" variant="outline" @click="student.clear()">{{ student.name.value }} ✕</DuoButton>
    </div>

    <p v-if="!valid" class="font-black text-duo-red text-xl capitalize">No practice mode for “{{ id }}”.</p>

    <template v-else>
      <NameGate v-if="!student.name.value" :error="nameError" @save="saveName" />
      <template v-else>
        <PracticeShell
          :config="cfg!"
          :answered="round.answered.value"
          :total="total"
          :correct="round.correct.value"
          :streak="round.streak.value"
          :xp="round.xp.value"
          :remaining="timer.remaining.value"
          :running="timer.running.value"
          :finished="round.finished.value"
          @toggle-timer="toggleTimer"
          @restart="startRound"
        >
          <component
            :is="entry!.component"
            ref="gameRef"
            :round="roundKey"
            @record="onRecord"
          />

          <template #summary>
            <DuoButton
              size="sm"
              variant="yellow"
              :disabled="submitting || !round.submittable.value || submittedXp !== null"
              :data-testid="'practice-submit-score'"
              @click="send"
            >{{ submittedXp !== null ? '✓ On the board' : submitting ? 'Saving…' : '📈 Save my score' }}</DuoButton>
          </template>
        </PracticeShell>

        <p v-if="notice" class="mt-2 text-sm font-bold text-duo-text-light" data-testid="practice-notice">{{ notice }}</p>

        <div class="mt-4">
          <LeaderboardPanel
            :entries="entries"
            :me="student.name.value"
            :loading="loadingBoard"
            :enabled="leaderboardEnabled()"
          />
        </div>
      </template>
    </template>
  </div>
</template>