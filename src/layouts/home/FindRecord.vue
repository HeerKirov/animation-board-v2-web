<template lang="pug">
div.ui.segment(v-if="incompletedItems.length > 0 || recordedItems.length > 0")
    template(v-if="incompletedItems.length > 0")
        h6.ui.horizontal.divider.header: router-link.color-black.pointer(:to="{name: 'Record.Find', query: {filter: 'INCOMPLETE'}}") 未订阅的进度
        div.ui.list
            div.item(v-for="item in incompletedItems") 
                router-link.font-size-12(:to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
                i.float-right.font-size-11(v-if="item.next != null") NEXT {{item.next}}
    template(v-if="recordedItems.length > 0")
        h6.ui.horizontal.divider.header: router-link.color-black.pointer(:to="{name: 'Record.Find', query: {filter: 'RECORDED'}}") 列入日记的项目
        div.ui.list
            div.item(v-for="item in recordedItems") 
                router-link.font-size-12(:to="{name: 'Record.Detail', params: {id: item.id}}") {{item.title}}
                i.float-right.font-size-11(v-if="item.next != null") NEXT {{item.next}}
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSWR } from '@/functions/server'

export default defineComponent({
    setup() {
        const { data: incompleteData } = useSWR('/api/personal/records/find', {filter: 'incomplete', order: 'create_time', limit: 10})
        const { data: recordedData } = useSWR('/api/personal/records/find', {filter: 'recorded', order: 'create_time', limit: 10})

        const incompletedItems = computed(() => incompleteData.value ? (incompleteData.value['result'] as any).map(mapItem) : [])
        const recordedItems = computed(() => recordedData.value ? (recordedData.value['result'] as any).map(mapItem) : [])

        return {incompletedItems, recordedItems}
    }
})

function mapItem(item: any) {
    const publishedEpisodes = item['published_episodes']
    const watchedEpisodes = item['watched_episodes'] ?? 0
    return {
        id: item['animation_id'],
        title: item['title'],
        next: publishedEpisodes > watchedEpisodes ? watchedEpisodes + 1 : null
    }
}
</script>

<style scoped>

</style>