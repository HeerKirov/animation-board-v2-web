<template lang="pug">
div.ui.container
    DetailPanel(v-if="true")
    EditPanel(v-else)
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect, provide } from 'vue'
import { useRoute } from 'vue-router'
import DetailPanel from '@/layouts/animation/detail/DetailPanel.vue'
import EditPanel from '@/layouts/animation/edit/EditPanel.vue'
import { useSWR } from '@/functions/server'
import { swrInjectionKey } from '@/definitions/injections'

export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {
        const route = useRoute()

        const swr = useSWR(computed(() => `/api/database/animations/${route.params['id']}`))

        provide(swrInjectionKey, swr)
    }
})
</script>

<style scoped>

</style>