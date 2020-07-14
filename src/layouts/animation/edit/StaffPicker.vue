<template lang="pug">
div.ui.icon.input.fluid.transparent
    input(placeholder="搜索STAFF", v-model="searchBoxText", @keydown.enter="requestForFirst")
    i.search.icon
div.ui.divider.mt-1
div.list-content
    div.ui.small.label.mb-1.pointer(v-for="item in result", :key="item.id", draggable="true", @dragstart="onDragStart($event, item)") {{item.name}}
    button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果
    p.mb-0: button.ui.tertiary.mini.button {{hasRequested ? '找不到想要的？新建STAFF条目' : '新建STAFF条目'}}
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from 'vue'
import { Method } from 'axios'
import { useServer, Response, RequestOptions, useContinuous } from '@/functions/server'

const limit = 40
const order = '-update_time'

//TODO 完成新建staff条目的功能
export default defineComponent({
    setup() {
        const { request } = useServer()

        const board = useBoard(request)

        const drag = useDrag()

        return {...board, ...drag}
    }
})

function useBoard(request: (url: string, method: Method, data?: any, options?: RequestOptions) => Promise<Response>) {
    const searchBoxText: Ref<string> = ref("")

    const { result, requestForFirst, requestForNext, hasNext, hasRequested } = useContinuous('/api/database/staffs', {
        findTotal(data) { return data['total'] },
        findData(data) { return (data['result'] as any[]).map(mapItem) },
        query(count, total, queryData) { return {offset: count, search: queryData, limit, order} },
        queryData: searchBoxText
    })

    return {result, hasNext, requestForNext, requestForFirst, hasRequested, searchBoxText}
}

function useDrag() {
    const onDragStart = (e: DragEvent, item: any) => {
        e.dataTransfer?.setData('item', JSON.stringify(item))
    }

    return {onDragStart}
}


function mapItem(item: any) {
    return {
        id: item['id'],
        name: item['name']
    }
}
</script>

<style scoped>
    .list-content {
        overflow: auto;
        max-height: 575px
    }
</style>
