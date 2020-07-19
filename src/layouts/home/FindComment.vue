<template lang="pug">
div.ui.segment
    h6.ui.horizontal.divider.header: router-link.color-black.pointer(:to="{name: 'Comment.Find'}") 亟待评分
    div.ui.inline.active.centered.loader(v-if="loading")
    ul.ui.list(v-else-if="items.length > 0")
        li.item(v-for="item in items") 
            router-link.font-size-11(:to="{name: 'Comment.New', params: {id: item.id}}") {{item.title}}
    div.text-center(v-else): i.font-size-12 没有待评分的动画了～
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSWR } from '@/functions/server'

export default defineComponent({
    setup() {
        const { loading, data } = useSWR('/api/personal/comments/find', {limit: 10})

        const items = computed(() => data.value ? (data.value['result'] as any).map(mapItem) : [])

        return {loading, items}
    }
})


function mapItem(item: any) {
    return {
        id: item['animation_id'],
        title: item['title']
    }
}
</script>