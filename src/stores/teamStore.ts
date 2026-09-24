import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Team } from '@/types'

const defaultTeams = (): Team[] => [
  { id:'1', name:'Team 1', color:'#58CC02', avatar:'🦊', score:0 },
  { id:'2', name:'Team 2', color:'#1CB0F6', avatar:'🐻', score:0 },
]

export const useTeamStore = defineStore('teams', ()=>{
  const teams = ref<Team[]>(defaultTeams())
  const activeId = ref<string>(teams.value[0].id)
  const streaks = ref<Record<string, number>>({})

  function setTeams(t: Team[]){ teams.value=t; if(!teams.value.find(x=>x.id===activeId.value)) activeId.value=teams.value[0]?.id ?? '' }
  function addScore(teamId:string, pts:number){
    const t = teams.value.find(x=>x.id===teamId)
    if(t) t.score+=pts
  }
  function addScoreWithStreak(teamId:string, base:number, streakBonus:number){
    addScore(teamId, base + streakBonus)
    streaks.value[teamId]=(streaks.value[teamId]||0)+1
  }
  function resetStreak(teamId:string){ streaks.value[teamId]=0 }
  function getStreak(teamId:string){ return streaks.value[teamId]||0 }
  function nextTurn(){
    const idx = teams.value.findIndex(t=>t.id===activeId.value)
    activeId.value = teams.value[(idx+1)%teams.value.length].id
  }
  function reset(){ teams.value=defaultTeams(); activeId.value=teams.value[0].id; streaks.value={} }
  return { teams, activeId, streaks, setTeams, addScore, addScoreWithStreak, resetStreak, getStreak, nextTurn, reset }
})
