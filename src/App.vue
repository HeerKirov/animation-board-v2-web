<template lang="pug">
TopBar
router-view.view
Footer
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopBar from "@/components/TopBar.vue"
import Footer from "@/components/Footer.vue"

export default defineComponent({
    components: {TopBar, Footer},
    setup() {
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
