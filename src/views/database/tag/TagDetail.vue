<template lang="pug">
div.ui.container
    DetailPanel(v-if="true")
    EditPanel(v-else)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DetailPanel from '@/layouts/tag/detail/DetailPanel.vue'
import EditPanel from '@/layouts/tag/edit/EditPanel.vue'

export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {

    }
})
</script>

<style scoped>

</style>