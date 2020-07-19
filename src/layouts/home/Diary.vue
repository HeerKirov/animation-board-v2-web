<template lang="pug">
div.ui.segment
    h5.ui.horizontal.divider.header: router-link.color-black.pointer(:to="{name: 'Record.Diary'}") 订阅
    div.ui.inline.active.centered.loader(v-if="loading")
    div.ui.list(v-else-if="items.length > 0")
        div.item(v-for="item in items") 
            router-link.font-size-12(:to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
            i.float-right.font-size-11 NEXT {{item.next}}
    div.text-center(v-else): i.font-size-12 没有存货了～
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSWR } from '@/functions/server'

export default defineComponent({
    setup() {
        const { loading, data } = useSWR('/api/personal/records/diary', {filter: 'watchable', order: 'subscription_time'})

        const items = computed(() => data.value ? (data.value['result'] as any).map(mapItem) : [])

        return {loading, items}
    }
})

function mapItem(item: any) {
    return {
        id: item['animation_id'],
        title: item['title'],
        next: (item['watched_episodes'] ?? 0) + 1
    }
}
</script>