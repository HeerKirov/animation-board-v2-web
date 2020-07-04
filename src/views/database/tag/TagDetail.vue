<template lang="pug">
div.ui.container
    DetailPanel(v-if="true")
    EditPanel(v-else)
</template>

<script lang="ts">
import { defineComponent, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import DetailPanel from '@/layouts/tag/detail/DetailPanel.vue'
import EditPanel from '@/layouts/tag/edit/EditPanel.vue'
import { useSWR } from '@/functions/server'
import { watchPageTitle } from '@/functions/document'
import { swrInjectionKey } from '@/definitions/injections'

export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {
        const route = useRoute()

        const swr = useSWR(computed(() => `/api/database/tags/${route.params['id']}`))

        watchPageTitle(() => swr.data.value?.['name'])

        provide(swrInjectionKey, swr)
    }
})
</script>

<style scoped>

</style>