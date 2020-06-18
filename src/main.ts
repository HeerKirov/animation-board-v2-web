import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'fomantic-ui-css/semantic.min.css'
import '@/styles/layout.css'
import '@/styles/format.css'

createApp(App)
    .use(router)
    .mount('#app')
