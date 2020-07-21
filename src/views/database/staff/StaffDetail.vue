<template lang="pug">
div.ui.container
    EditPanel(v-if="editMode")
    DetailPanel(v-else)
</template>

<script lang="ts">
import { defineComponent, computed, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DetailPanel from '@/layouts/staff/detail/DetailPanel.vue'
import EditPanel from '@/layouts/staff/edit/EditPanel.vue'
import { useSWR } from '@/functions/server'
import { watchPageTitle } from '@/functions/document'
import { swrInjectionKey, editInjectionKey } from '@/definitions/injections'

export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {
        const route = useRoute()

        const swr = useSWR(computed(() => route.name === 'Staff.Detail' && route.params['id'] ? `/api/database/staffs/${route.params['id']}` : null))

        const editMode = ref(false)
        watch(() => route.params, () => { editMode.value = false })

        watchPageTitle(() => swr.data.value?.['name'])

        provide(swrInjectionKey, swr)
        provide(editInjectionKey, editMode)

        return {editMode}
    }
})
</script>