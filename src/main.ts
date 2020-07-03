import { createApp } from 'vue'
import { auth, server, document } from '@/plugins'
import App from '@/App.vue'
import router from '@/router'
import '@/styles/layout.css'
import '@/styles/format.css'


createApp(App)
    .use(router)
    .use(auth)
    .use(server)
    .use(document)
    .mount('#app')
