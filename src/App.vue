<template lang="pug">
TopBar
router-view.view
Footer
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopBar from "@/layouts/TopBar.vue"
import Footer from "@/layouts/Footer.vue"
import { provideAuth } from '@/functions/auth'
import config from '@/config'

export default defineComponent({
    components: {TopBar, Footer},
    setup() {
        provideAuth({
            basicServiceUrl: config.BASIC_SERVICE_URL,
            serverUrl: config.SERVER_URL,
            storagePrefix: config.STORAGE_PREFIX,
            tokenEffective: config.TOKEN_EFFECTIVE
        })

        return {}
    }
})
</script>

<style>
    body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    .view {
        margin-top: 60px;
    }
</style>
