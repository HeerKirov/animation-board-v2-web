import { createApp } from 'vue'
import { auth, server, document, notification, messageBox } from '@/plugins'
import App from '@/App.vue'
import router from '@/router'
import '@/styles/layout.css'
import '@/styles/format.css'
import '@/styles/util.css'


createApp(App)
    .use(router)
    .use(auth)
    .use(server)
    .use(document)
    .use(notification)
    .use(messageBox)
    .mount('#app')
