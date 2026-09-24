<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePackStore } from '@/stores/packStore'
import { useTeamStore } from '@/stores/teamStore'
import { pictionarySeed } from '@/data/seed'
import { useTimer } from '@/composables/useTimer'
import { xpForPictionary } from './logic'
import DuoButton from '@/components/ui/DuoButton.vue'
import { pickRandomIndexExcluding } from '@/utils/random'
import DuoCard from '@/components/ui/DuoCard.vue'
import { fireConfetti, playSfx } from '@/utils/effects'
import { usePowerUps } from '@/composables/usePowerUps'
import PowerUpsBar from '@/components/shared/PowerUpsBar.vue'
import XpToast from '@/components/shared/XpToast.vue'
import BonusSpin from '@/components/shared/BonusSpin.vue'
import ScoreBoard from '@/components/shared/ScoreBoard.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'

const packStore = usePackStore()
const teamStore = useTeamStore()
const power = usePowerUps()
const toastXp = ref(0)
const showToast = ref(false)
const showBonus = ref(false)
const list = computed(()=> (packStore.overrides['pictionary'] as any) ?? pictionarySeed)
const idx = ref(Math.floor(Math.random()* (list.value.length || 1)))
const cur = computed(()=> list.value[idx.value])
const timer = useTimer(60)
const reveal = ref(false)
const canvasRef = ref<HTMLCanvasElement|null>(null)
let ctx: CanvasRenderingContext2D|null=null
let drawing=false
let color='#4B4B4B'
function start(){ reveal.value=false; timer.start(60); clearCanvas() }
onMounted(()=>{ if(canvasRef.value){ ctx=canvasRef.value.getContext('2d'); if(ctx) ctx.lineWidth=4; } start() })
function clearCanvas(){ if(!ctx) return; ctx.clearRect(0,0,800,400); ctx.fillStyle='white'; ctx.fillRect(0,0,800,400) }
function pos(e:any){ const r=canvasRef.value!.getBoundingClientRect(); const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; return {x: x*(800/r.width), y: y*(400/r.height)} }
function down(e:any){ drawing=true; const {x,y}=pos(e); ctx!.beginPath(); ctx!.moveTo(x,y) }
function move(e:any){ if(!drawing) return; const {x,y}=pos(e); ctx!.lineTo(x,y); ctx!.strokeStyle=color; ctx!.stroke() }
function up(){ drawing=false }
function correct(){ const xp=xpForPictionary(timer.remaining.value, timer.total.value); timer.stop(); teamStore.addScoreWithStreak(teamStore.activeId, xp, 0);
    toastXp.value=xp; showToast.value=false; setTimeout(()=> showToast.value=true, 10)
    fireConfetti(); playSfx('correct')
    if(teamStore.getStreak(teamStore.activeId)>=3) showBonus.value=true
    reveal.value=true }
function next(){ idx.value=pickRandomIndexExcluding(list.value.length, idx.value); start() }

function doFreeze(){ if(power.useFreeze()){ timer.stop(); setTimeout(()=> timer.start(timer.remaining.value), 5000) } }
function onBonus(xp:number){ teamStore.addScore(teamStore.activeId, xp); playSfx('bonus'); showBonus.value=false; teamStore.resetStreak(teamStore.activeId) }
</script>
<template>
  <div class="space-y-4">
    <ScoreBoard :teams="teamStore.teams" :activeId="teamStore.activeId" :streaks="teamStore.streaks" />
    <div class="flex justify-between font-black text-sm"><span>Pictionary · {{ cur.category }} · {{ idx+1 }}/{{ list.length }}</span><span>{{ timer.remaining.value }}s</span></div>
    <ProgressBar :value="timer.remaining.value" :max="timer.total.value" color="#FFC800" />
    <div class="grid md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <canvas ref="canvasRef" width="800" height="400" class="w-full bg-white rounded-2xl border-2 border-duo-gray touch-none" @mousedown="down" @mousemove="move" @mouseup="up" @mouseleave="up" @touchstart.prevent="down" @touchmove.prevent="move" @touchend="up" data-testid="canvas"></canvas>
        <div class="flex gap-2 mt-2">
          <button v-for="c in ['#4B4B4B','#FF4B4B','#1CB0F6','#58CC02']" :key="c" @click="color=c" :style="{background:c}" class="w-8 h-8 rounded-full border-2" :class="color===c?'border-duo-blue':''"></button>
          <DuoButton size="sm" variant="outline" @click="clearCanvas">Clear</DuoButton>
        </div>
      </div>
      <DuoCard class="text-center">
        <p class="text-xs font-black tracking-widest uppercase text-duo-text-light">Prompt (teacher sees)</p>
        <p class="text-2xl font-black mt-2" :class="reveal?'text-duo-blue':''">{{ reveal ? cur.prompt : '???' }}</p>
        <p class="text-sm font-bold text-duo-text-light">{{ cur.hint }}</p>
        <div class="flex flex-col gap-2 mt-4">
          <DuoButton @click="correct" data-testid="correct-btn">✅ Correct +{{ xpForPictionary(timer.remaining.value, timer.total.value) }} XP ({{ teamStore.teams.find(t=>t.id===teamStore.activeId)?.name }})</DuoButton>
          <DuoButton variant="outline" @click="reveal=!reveal">{{ reveal?'Hide':'Reveal' }}</DuoButton>
          <DuoButton variant="secondary" @click="next">Next Prompt →</DuoButton>
        </div>
      </DuoCard>
    </div>
  </div>
</template>
