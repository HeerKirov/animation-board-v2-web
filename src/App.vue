<template lang="pug">
TopBar
router-view.view
Footer
Notification
Modal
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopBar from '@/layouts/TopBar.vue'
import Footer from '@/layouts/Footer.vue'
import Notification from '@/layouts/Notification.vue'
import Modal from '@/layouts/MessageBox.vue'
import { watchRouterTitle } from '@/functions/document'

export default defineComponent({
    components: {TopBar, Footer, Notification, Modal},
    setup() {
        watchRouterTitle()
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
    html::-webkit-scrollbar {
        display: none;
    }
</style>
