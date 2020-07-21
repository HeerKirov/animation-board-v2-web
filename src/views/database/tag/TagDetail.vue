<template lang="pug">
div.ui.container
    EditPanel(v-if="editMode")
    DetailPanel(v-else)
</template>

<script lang="ts">
import { defineComponent, computed, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DetailPanel from '@/layouts/tag/detail/DetailPanel.vue'
import EditPanel from '@/layouts/tag/edit/EditPanel.vue'
import { useSWR } from '@/functions/server'
import { watchPageTitle } from '@/functions/document'
import { editInjectionKey, swrInjectionKey } from '@/definitions/injections'

export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {
        const route = useRoute()

        const swr = useSWR(computed(() => route.name === 'Tag.Detail' && route.params['id'] ? `/api/database/tags/${route.params['id']}` : null))

        const editMode = ref(false)
        watch(() => route.params, () => { editMode.value = false })

        watchPageTitle(() => swr.data.value?.['name'])

        provide(swrInjectionKey, swr)
        provide(editInjectionKey, editMode)

        return {editMode}
    }
})
</script>