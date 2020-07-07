<template lang="pug">
TopBar
router-view.view
Footer
Notification
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopBar from '@/layouts/TopBar.vue'
import Footer from '@/layouts/Footer.vue'
import Notification from '@/layouts/Notification.vue'
import { watchRouterTitle } from '@/functions/document'

export default defineComponent({
    components: {TopBar, Footer, Notification},
    setup() {
        watchRouterTitle()

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
