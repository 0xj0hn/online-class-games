import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { usePackStore } from './stores/packStore'

const app = createApp(App)
app.use(createPinia())
app.use(router)

void usePackStore().load()

app.mount('#app')
