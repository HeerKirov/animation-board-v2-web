<template lang="pug">
div.ui.icon.input.fluid.transparent
    input(placeholder="搜索STAFF", v-model="searchBoxText", @keydown.enter="requestForData")
    i.search.icon
div.ui.divider.mt-1
div.list-content
    div.ui.small.label.mb-1.pointer(v-for="item in items", :key="item.id", draggable="true", @dragstart="onDragStart($event, item)") {{item.name}}
    button.ui.tertiary.mini.button(v-if="hasNext", @click="requestForNext") 获取更多结果
    p.mb-0: button.ui.tertiary.mini.button {{searched ? '找不到想要的？新建STAFF条目' : '新建STAFF条目'}}
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from 'vue'
import { Method } from 'axios'
import { useServer, Response, RequestOptions } from '@/functions/server'

const limit = 40
const order = '-update_time'

export default defineComponent({
    setup() {
        const { request } = useServer()

        const board = useBoard(request)

        const drag = useDrag()

        return {...board, ...drag}
    }
})

function useBoard(request: (url: string, method: Method, data?: any, options?: RequestOptions) => Promise<Response>) {
    const total: Ref<number | null> = ref(null)
    const items: Ref<any[]> = ref([])
    const hasNext = computed(() => total.value != null && items.value.length < total.value)

    const searched = ref(false)
    const searchBoxText: Ref<string> = ref("")
    let search: string | undefined = undefined

    const requestForData = async () => {
        search = searchBoxText.value || undefined
        const r = await request('/api/database/staffs', 'GET', {search, limit, offset: 0, order})
        if(r.ok) {
            items.value = r.data['result'].map(mapItem)
            total.value = r.data['total']
        }else{
            items.value = []
            total.value = null
        }
        searched.value = true
    }

    const requestForNext = async () => {
        if(hasNext.value) {
            const r = await request('/api/database/staffs', 'GET', {search, limit, offset: items.value.length, order})
            if(r.ok) {
                total.value = r.data['total']
                items.value = items.value.concat(r.data['result'].map(mapItem))
            }
        }
    }

    return {items, hasNext, requestForNext, requestForData, searchBoxText, searched}
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