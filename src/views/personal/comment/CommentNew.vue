<template lang="pug">
div.ui.container
    div.ui.secondary.pointing.menu
        router-link.item(v-for="item in barItems", :class="{active: item.name === 'new'}", :to="item.link")
            i(:class="item.icon")
            = '{{item.title}}'
        a.right.item.disabled(v-if="updateLoading")
            i.notched.circle.loading.icon
            = '提交'
        a.right.item(@click="onSubmit", :class="{disabled: !valueExists}", v-else)
            i.check.icon
            = '提交'
    div.ui.grid
        div.ui.fourteen.wide.centered.column
            Editor(@update:value="onEditorChanged", :title="title")
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Editor, { Instance } from '@/layouts/comment/edit/Editor.vue'
import { topBarItems, newItem } from '@/definitions/secondary-bar'
import { useSWR } from '@/functions/server'
import { useCreatorForm } from '@/functions/editor'

export default defineComponent({
    components: {Editor},
    computed: {
        barItems: () => [topBarItems.comment, newItem]
    },
    setup() {
        const router = useRouter()
        const route = useRoute()

        const id = computed(() => route.params['id'] as string)
        const { data: animation } = useSWR(computed(() => route.name === 'Comment.New' && route.params['id'] ? `/api/database/animations/${route.params['id']}` : null))
        const title = computed(() => animation.value ? animation.value['title'] : null)

        const form = useCreatorForm<Instance>('/api/personal/comments', i => remapData(i, id), {
            success(r) { router.push({name: 'Comment.Detail', params: {id: r.data['animation_id']}}) }
        })

        return {...form, title}
    }
})

function remapData(item: Instance, id: Ref<string>) {
    return {
        animation_id: parseInt(id.value),
        score: item.score,
        article_title: item.articleTitle,
        article: item.article
    }
}
</script>
