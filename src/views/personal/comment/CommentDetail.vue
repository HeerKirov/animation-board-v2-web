<template lang="pug">
div.ui.container
    EditPanel(v-if="editMode")
    DetailPanel(v-else)
</template>

<script lang="ts">
import { defineComponent, computed, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DetailPanel from '@/layouts/comment/detail/DetailPanel.vue'
import EditPanel from '@/layouts/comment/edit/EditPanel.vue'
import { useSWR } from '@/functions/server'
import { watchPageTitle } from '@/functions/document'
import { swrInjectionKey, editInjectionKey } from '@/definitions/injections'


export default defineComponent({
    components: {DetailPanel, EditPanel},
    setup() {
        const route = useRoute()
        const router = useRouter()

        const swr = useSWR(computed(() => route.name === 'Comment.Detail' && route.params['id'] ? `/api/personal/comments/${route.params['id']}` : null), null, {
            byAuthorization: 'LOGIN',
            errorHandler(code, data, parent) {
                if(code === 404) {
                    router.replace({name: 'Comment.New', params: {id: route.params['id']}})
                }else{
                    parent?.(code, data)
                }
            }
        })

        const editMode = ref(false)

        watchPageTitle(() => swr.data.value?.["title"])

        provide(swrInjectionKey, swr)
        provide(editInjectionKey, editMode)

        return {editMode}
    }
})
</script>
