<template lang="pug">
div.ui.container
    DetailPanel
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DetailPanel from '@/layouts/animation/detail/DetailPanel.vue'
import EditPanel from '@/layouts/animation/edit/EditPanel.vue'

export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {

    }
})
</script>

<style scoped>

</style>