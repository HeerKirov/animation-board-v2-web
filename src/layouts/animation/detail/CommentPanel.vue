<template lang="pug">
div.ui.segment.panel(v-if="loading")
    div.ui.active.inverted.dimmer
        div.ui.loader
div.ui.segment.panel(v-else-if="data")
    div.mb-3
        router-link(:to="{name: 'Comment.Detail', params: {id}}")
            i.bookmark.icon
            = '评价'
        Starlight.float-right(:value="data.score")
    div
        i.quote.left.icon.font-size-11
        span(v-if='data.description') {{data.description}}
        i(v-else) 没有编写评论
        i.quote.right.icon.font-size-11
div.ui.placeholder.segment.panel(v-else)
    span.font-size-14.text-center.is-weight.mb-1 未评价此动画
    router-link.ui.primary.button(:to="{name: 'Comment.New', params: {id}}")
        i.bookmark.icon
        = '编写评价'
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import Starlight from '@/components/Starlight.vue'
import { useSWR } from '@/functions/server'

export default defineComponent({
    components: {Starlight},
    setup() {
        const route = useRoute()

        const id = computed(() => route.params['id'])

        const { loading, data } = useSWR(computed(() => route.name === 'Animation.Detail' && route.params['id'] ? `/api/personal/comments/${route.params['id']}` : null), null, {
            byAuthorization: 'LOGIN',
            errorHandler(code, data, parent) {
                if(code !== 404 && code !== 403 && code !== 401) parent?.(code, data)
            }
        })
        const dataComputed = computed(() => data.value ? mapData(data.value) : null)

        return {id, loading, data: dataComputed}
    }
})

function mapData(item: any) {
    return {
        score: item['score'],
        description: item['article_title'] || (item['article'] ? splitArticle(item['article']) : null)
    }
}

function splitArticle(article: string): string {
    const max = 30
    if(article.length > max) return article.substring(0, max) + "..."
    else return article
}
</script>

<style scoped>
    .panel {
        min-height: 107px !important;
    }
</style>
