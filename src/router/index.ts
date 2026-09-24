import { createRouter, createWebHistory } from 'vue-router'
import LobbyView from '@/views/LobbyView.vue'
import AdminView from '@/views/AdminView.vue'
import GameView from '@/views/GameView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LobbyView },
    { path: '/game/:id', component: GameView, props:true },
    { path: '/admin', component: AdminView },
  ]
})
