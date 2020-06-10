<template lang="pug">
div
  TopBar
  div.container(style="height: 640px")
    Breadcrumb
    router-view
  Footer
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopBar from "@/components/TopBar.vue"
import Breadcrumb from "@/components/Breadcrumb.vue"
import Footer from "@/components/Footer.vue"

export default defineComponent({
    components: {TopBar, Breadcrumb, Footer},
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
</style>
