import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/styles/layout.css'
import '@/styles/format.css'

createApp(App)
    .use(router)
    .mount('#app')
